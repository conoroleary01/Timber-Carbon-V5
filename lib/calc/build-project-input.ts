import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MaterialLineInput, ProjectInput } from "@/lib/types";

type BuildProjectInputResult = {
  projectInput: ProjectInput;
};

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function weightedInboundFactor(
  origin: {
    road_share: number | null;
    sea_share: number | null;
    rail_share: number | null;
    road_factor_kgco2e_per_tkm: number | null;
    sea_factor_kgco2e_per_tkm: number | null;
    rail_factor_kgco2e_per_tkm: number | null;
  } | null,
) {
  if (!origin) return 0;

  return (
    toNumber(origin.road_share) * toNumber(origin.road_factor_kgco2e_per_tkm) +
    toNumber(origin.sea_share) * toNumber(origin.sea_factor_kgco2e_per_tkm) +
    toNumber(origin.rail_share) * toNumber(origin.rail_factor_kgco2e_per_tkm)
  );
}

export async function buildProjectInputFromSupabase(
  projectId: number,
): Promise<BuildProjectInputResult> {
  const supabase = createServerSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, project_name, project_location, reporting_area_m2, gia_demolished_m2, a4_distance_km",
    )
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Project not found");
  }

  const { data: boqLines, error: boqError } = await supabase
    .from("project_boq_lines")
    .select(
      "id, raw_description, boq_qty, boq_unit, matched_product_id, review_status",
    )
    .eq("project_id", projectId)
    .not("matched_product_id", "is", null);

  if (boqError) {
    throw new Error(boqError.message);
  }

  const productIds = [
    ...new Set(
      (boqLines ?? [])
        .map((row) => row.matched_product_id)
        .filter((value): value is number => typeof value === "number"),
    ),
  ];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds.length ? productIds : [-1]);

  if (productsError) {
    throw new Error(productsError.message);
  }

  const { data: epds, error: epdError } = await supabase
    .from("epd_records")
    .select("*")
    .in("product_id", productIds.length ? productIds : [-1]);

  if (epdError) {
    throw new Error(epdError.message);
  }

  const materialFamilies = [
    ...new Set(
      (products ?? [])
        .map((product) => product.material_family)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  ];

  const { data: wasteDefaults, error: wasteError } = await supabase
    .from("waste_defaults")
    .select("*")
    .in("material_family", materialFamilies.length ? materialFamilies : ["__none__"]);

  if (wasteError) {
    throw new Error(wasteError.message);
  }

  const { data: transportOrigins, error: transportError } = await supabase
    .from("transport_origins")
    .select("*")
    .in("product_id", productIds.length ? productIds : [-1]);

  if (transportError) {
    throw new Error(transportError.message);
  }

  const { data: productCFactors, error: productCFactorsError } = await supabase
    .from("product_c_factors")
    .select("*")
    .in("product_id", productIds.length ? productIds : [-1]);

  if (productCFactorsError) {
    throw new Error(productCFactorsError.message);
  }

  const { data: materialFamilyCFactors, error: materialFamilyCFactorsError } =
    await supabase
      .from("material_family_c_factors")
      .select("*")
      .in(
        "material_family",
        materialFamilies.length ? materialFamilies : ["__none__"],
      );

  if (materialFamilyCFactorsError) {
    throw new Error(materialFamilyCFactorsError.message);
  }

  const { data: moduleDefaults, error: moduleDefaultsError } = await supabase
    .from("module_defaults")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  if (moduleDefaultsError || !moduleDefaults) {
    throw new Error("Active module defaults not found");
  }

  const { data: manufacturingFactor, error: manufacturingError } = await supabase
    .from("manufacturing_allocation_factors")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  if (manufacturingError || !manufacturingFactor) {
    throw new Error("Active manufacturing allocation factor not found");
  }

  const materials: MaterialLineInput[] = (boqLines ?? []).map((line) => {
    const product = (products ?? []).find((p) => p.id === line.matched_product_id);

    if (!product) {
      throw new Error(`Mapped product not found for BOQ line ${line.id}`);
    }

    const epd = (epds ?? []).find((e) => e.product_id === product.id);
    const waste = (wasteDefaults ?? []).find(
      (w) => w.material_family === product.material_family,
    );
    const origin = (transportOrigins ?? []).find((t) => t.product_id === product.id);
    const productCFactor = (productCFactors ?? []).find(
      (c) => c.product_id === product.id,
    );
    const familyCFactor = (materialFamilyCFactors ?? []).find(
      (c) => c.material_family === product.material_family,
    );

    return {
      id: String(line.id),
      name: line.raw_description ?? product.name ?? `Line ${line.id}`,

      boqQty: toNumber(line.boq_qty),
      boqUnit: line.boq_unit ?? "",
      declaredUnit: product.declared_unit ?? "",

      conversionMode: "manual",
      conversionFactorToDeclaredUnit: 0,

      thicknessM: product.thickness_m ?? undefined,
      densityKgPerM3: product.density_kg_per_m3 ?? undefined,
      surfaceMassKgPerM2: product.surface_mass_kg_per_m2 ?? undefined,
      massKgPerItem: product.mass_kg_per_item ?? undefined,
      itemsPerBoqUnit: product.items_per_boq_unit ?? undefined,

      factoryWasteRate: toNumber(waste?.factory_waste_rate),
      siteWasteRate: toNumber(waste?.site_waste_rate),

      epdA1A3KgCO2ePerDeclaredUnit: toNumber(
        epd?.a1_a3_kgco2e_per_declared_unit,
      ),

      biogenicMethod: (product.biogenic_method ?? "none") as
        | "none"
        | "fallback_1_64"
        | "epd",
      woodMassFraction: product.wood_mass_fraction ?? undefined,
      epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit:
        product.epd_stored_biogenic_carbon_kgco2e_per_declared_unit ?? undefined,

      massTonnesPerDeclaredUnit: 0,

      inboundDistanceKm: toNumber(origin?.distance_to_cygnum_km),
      inboundTransportKgCO2ePerTkm: weightedInboundFactor(origin ?? null),

      factoryWasteTransportDistanceKm: toNumber(
        waste?.factory_waste_transport_distance_km,
      ),
      factoryWasteTransportKgCO2ePerTkm: toNumber(
        waste?.factory_waste_transport_factor_kgco2e_per_tkm,
      ),
      factoryWasteTreatmentKgCO2ePerDeclaredUnit: toNumber(
        waste?.factory_waste_treatment_kgco2e_per_declared_unit,
      ),

      siteWasteTransportDistanceKm: toNumber(
        waste?.site_waste_transport_distance_km,
      ),
      siteWasteTransportKgCO2ePerTkm: toNumber(
        waste?.site_waste_transport_factor_kgco2e_per_tkm,
      ),
      siteWasteTreatmentKgCO2ePerDeclaredUnit: toNumber(
        waste?.site_waste_treatment_kgco2e_per_declared_unit,
      ),

      materialFamily: product.material_family ?? undefined,
      c2KgCO2ePerKg:
        productCFactor?.c2_kgco2e_per_kg != null
          ? toNumber(productCFactor.c2_kgco2e_per_kg)
          : toNumber(moduleDefaults.c2_kgco2e_per_kg),
      c3c4KgCO2ePerKg: toNumber(familyCFactor?.c3c4_kgco2e_per_kg),
    };
  });

  const projectInput: ProjectInput = {
    projectName: project.project_name ?? "Untitled project",
    reportingAreaM2: toNumber(project.reporting_area_m2),
    giaDemolishedM2: toNumber(project.gia_demolished_m2),
    referenceStudyPeriodYears: 50,
    assumptions: [
      "Built from Supabase project, mapped BOQ rows, products, EPDs, waste defaults, transport origins, active manufacturing factor, and active module defaults.",
    ],
    materials,
    factory: {
      allocatedManufacturingKgCO2e:
        toNumber(project.reporting_area_m2) *
        toNumber(manufacturingFactor.allocation_factor_kgco2e_per_unit),
      a4DistanceKm: toNumber(project.a4_distance_km),
    },
    endOfLife: {
      c1KgCO2e:
        toNumber(project.reporting_area_m2) *
        toNumber(moduleDefaults.c1_kgco2e_per_m2),
      routes: [],
    },
    moduleDefaults: {
      a4TransportFactorKgCO2ePerTkm: toNumber(
        moduleDefaults.a4_transport_factor_kgco2e_per_tkm,
      ),
      a5DemolitionKgCO2ePerM2: toNumber(
        moduleDefaults.a5_demolition_kgco2e_per_m2,
      ),
      a5ConstructionConstantKgCO2e: toNumber(
        moduleDefaults.a5_construction_constant_kgco2e,
      ),
      a5PercentOfA1A4: toNumber(moduleDefaults.a5_percent_of_a1_a4),
      b2FractionOfA1A5: toNumber(moduleDefaults.b2_fraction_of_a1_a5),
      b3FractionOfB2: toNumber(moduleDefaults.b3_fraction_of_b2),
      c1KgCO2ePerM2: toNumber(moduleDefaults.c1_kgco2e_per_m2),
      c2KgCO2ePerKg: toNumber(moduleDefaults.c2_kgco2e_per_kg),
    },
  };

  return { projectInput };
}