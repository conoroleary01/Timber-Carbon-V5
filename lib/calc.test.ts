import { describe, expect, it } from "vitest";
import { calculateProject } from "./calc";
import { sampleProject } from "./sample-project";
import type { ProjectInput } from "./types";

function closeTo(value: number, expected: number, digits = 8) {
  expect(value).toBeCloseTo(expected, digits);
}

describe("calculateProject", () => {
  it("calculates a simple one-line project correctly", () => {
    const project: ProjectInput = {
      projectName: "Micro test",
      reportingAreaM2: 10,
      giaDemolishedM2: 0,
      referenceStudyPeriodYears: 25,
      assumptions: [],

      materials: [
        {
          id: "test-line",
          name: "Test line",
          boqQty: 10,
          boqUnit: "m2",
          conversionMode: "manual",
          conversionFactorToDeclaredUnit: 2,
          declaredUnit: "kg",
          factoryWasteRate: 0.2,
          siteWasteRate: 0.1,
          epdA1A3KgCO2ePerDeclaredUnit: 3,
          massTonnesPerDeclaredUnit: 0.01,
          inboundDistanceKm: 100,
          inboundTransportKgCO2ePerTkm: 0.5,
          factoryWasteTransportDistanceKm: 20,
          factoryWasteTransportKgCO2ePerTkm: 0.5,
          factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0.2,
          siteWasteTransportDistanceKm: 30,
          siteWasteTransportKgCO2ePerTkm: 0.5,
          siteWasteTreatmentKgCO2ePerDeclaredUnit: 0.4,
          
        },
      ],

      factory: {
  allocatedManufacturingKgCO2e: 10,
  a4DistanceKm: 50,
},

      

    
      

      endOfLife: {
        c1KgCO2e: 3,
        routes: [
          {
            id: "eol-1",
            name: "Simple route",
            massTonnes: 2,
            distanceKm: 10,
            transportKgCO2ePerTkm: 0.5,
            processingKgCO2ePerTonne: 4,
            disposedMassTonnes: 1.5,
            disposalKgCO2ePerTonne: 6,
          },
        ],
      },

      
    };

    const result = calculateProject(project);
    const line = result.materials[0];

    closeTo(line.declaredInstalledQty, 20);
    closeTo(line.grossFactoryInputQty, 25);
    closeTo(line.factoryWasteQty, 5);

    closeTo(line.supplierA1A3NetKgCO2e, 60);
    closeTo(line.factoryWasteUpstreamKgCO2e, 15);
    closeTo(line.supplierA1A3GrossKgCO2e, 75);

    closeTo(line.inboundTransportKgCO2e, 1.25);
    closeTo(line.factoryWasteTransportKgCO2e, 0.05);
    closeTo(line.factoryWasteTreatmentKgCO2e, 1);

    closeTo(line.siteInputQty, 22.22222222);
    closeTo(line.siteWasteQty, 2.22222222);
    closeTo(line.siteWasteUpstreamKgCO2e, 6.66666667);
    closeTo(line.siteWasteTransportKgCO2e, 0.033333333);
    closeTo(line.siteWasteTreatmentKgCO2e, 0.88888889);

    closeTo(result.modules.A4DeliveredMassTonnes, 0.022222222);
    closeTo(result.modules.A4KgCO2e, 0.192414444);
    

    

    
   closeTo(result.modules.finishedProductA1A3KgCO2e, 87.3);

closeTo(result.modules.A5DemolitionKgCO2e, 0);
closeTo(result.modules.A5ConstructionKgCO2e, 200);
closeTo(result.modules.A5PercentOfA1A4KgCO2e, 0.87492414);
closeTo(result.modules.A5KgCO2e, 200.87492414);

closeTo(result.modules.upfrontCarbonKgCO2e, 288.36733859);
closeTo(result.modules.embodiedCarbonTotalKgCO2e, 318.36733859);




    

    
    closeTo(result.modules.C1KgCO2e, 3);
    closeTo(result.modules.C2KgCO2e, 10);
    closeTo(result.modules.C3KgCO2e, 8);
    closeTo(result.modules.C4KgCO2e, 9);

    
    

    
    expect(result.checks.every((c) => c.pass)).toBe(true);
  });

 

 it("calculates the sample project totals consistently", () => {
  const result = calculateProject(sampleProject);

  closeTo(result.modules.purchasedProductsA1A3KgCO2e, 6106.328976759889);
  closeTo(result.modules.inboundTransportKgCO2e, 176.59896218596185);
  closeTo(result.modules.factoryWasteEndProcessingKgCO2e, 9.458044332036188);
  closeTo(result.modules.finishedProductA1A3KgCO2e, 7142.385983277887);

  closeTo(result.modules.A4DeliveredMassTonnes, 10.702512427026416);
  closeTo(result.modules.A4KgCO2e, 296.5417895240713);

  closeTo(result.modules.A5DemolitionKgCO2e, 0);
  closeTo(result.modules.A5ConstructionKgCO2e, 2400);
  closeTo(result.modules.A5PercentOfA1A4KgCO2e, 74.3892777280196);
  closeTo(result.modules.A5FossilKgCO2e, 2474.38927772802);
  closeTo(result.modules.storedBiogenicCarbonKgCO2e, 0);
  closeTo(result.modules.A5BiogenicKgCO2e, 0);
  closeTo(result.modules.netStoredBiogenicCarbonKgCO2e, 0);
  closeTo(result.modules.A5KgCO2e, 2474.38927772802);

  closeTo(result.modules.upfrontCarbonKgCO2e, 9913.317050529979);

  
  closeTo(result.modules.C1KgCO2e, 180);
  closeTo(result.modules.C2KgCO2e, 55.44);
  closeTo(result.modules.C3KgCO2e, 156.8);
  closeTo(result.modules.C4KgCO2e, 68.2);

  closeTo(result.modules.embodiedCarbonTotalKgCO2e, 10373.75705052998);
  

  expect(result.modules.upfrontCarbonPerM2KgCO2e).not.toBeNull();
expect(result.modules.embodiedCarbonPerM2KgCO2e).not.toBeNull();

closeTo(result.modules.upfrontCarbonPerM2KgCO2e!, 82.61097542108315);
closeTo(result.modules.embodiedCarbonPerM2KgCO2e!, 86.44797542108316);
  expect(result.checks.every((c) => c.pass)).toBe(true);
});

  it("throws on invalid waste rates", () => {
    const badProject: ProjectInput = {
      ...sampleProject,
      materials: [
        {
          ...sampleProject.materials[0],
          factoryWasteRate: 1,
        },
      ],
    };

    expect(() => calculateProject(badProject)).toThrow(
      /factoryWasteRate must be between 0 and less than 1/i,
    );


  });

  it("auto-derives m2 to kg from thickness and density", () => {
  const project: ProjectInput = {
    projectName: "Auto area to mass",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "board-auto",
        name: "Board auto",
        boqQty: 10,
        boqUnit: "m2",
        declaredUnit: "kg",
        conversionMode: "manual",
        conversionFactorToDeclaredUnit: 0,
        thicknessM: 0.015,
        densityKgPerM3: 800,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  const line = result.materials[0];

  closeTo(line.declaredInstalledQty, 120);
  closeTo(line.deliveredToSiteMassTonnes, 0.12);
});
it("auto-derives declared m2 mass factor from surface mass", () => {
  const project: ProjectInput = {
    projectName: "Declared m2 mass factor",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "sheet-auto",
        name: "Sheet auto",
        boqQty: 5,
        boqUnit: "m2",
        declaredUnit: "m2",
        conversionMode: "manual",
        conversionFactorToDeclaredUnit: 0,
        surfaceMassKgPerM2: 18,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 2,
        massTonnesPerDeclaredUnit: 0,
        inboundDistanceKm: 100,
        inboundTransportKgCO2ePerTkm: 1,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  const line = result.materials[0];

  closeTo(line.declaredInstalledQty, 5);
  closeTo(line.grossInputMassTonnes, 0.09);
  closeTo(line.inboundTransportKgCO2e, 9);
});

it("calculates fallback biogenic storage and A5 biogenic release for timber", () => {
  const project: ProjectInput = {
    projectName: "Biogenic fallback test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "clt-bio",
        name: "CLT biogenic test",
        boqQty: 10,
        boqUnit: "m2",
        declaredUnit: "m3",
        conversionMode: "thickness",
        conversionFactorToDeclaredUnit: 0,
        thicknessM: 0.1,
        densityKgPerM3: 500,

        factoryWasteRate: 0,
        siteWasteRate: 0.01,

        epdA1A3KgCO2ePerDeclaredUnit: 100,

        biogenicMethod: "fallback_1_64",
        woodMassFraction: 1,

        massTonnesPerDeclaredUnit: 0,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  const line = result.materials[0];

  // 10 m2 × 0.1 m = 1 m3 installed
  closeTo(line.declaredInstalledQty, 1);

  // 1 m3 × 0.5 t/m3 × 1000 = 500 kg installed mass
  closeTo(line.installedMassKg, 500);

  // 500 × -1.64 = -820 kgCO2e stored biogenic carbon
  closeTo(line.storedBiogenicCarbonKgCO2e, -820);

  // abs(-820) × 0.01 = 8.2 kgCO2e A5 biogenic release
  closeTo(line.a5BiogenicKgCO2e, 8.2);

  // -820 + 8.2 = -811.8 net stored after A5
  closeTo(line.netStoredBiogenicCarbonKgCO2e, -811.8);

  closeTo(result.modules.storedBiogenicCarbonKgCO2e, -820);
  closeTo(result.modules.A5BiogenicKgCO2e, 8.2);
  closeTo(result.modules.netStoredBiogenicCarbonKgCO2e, -811.8);

  // Fossil A5 still follows the existing project formula
  closeTo(result.modules.A5DemolitionKgCO2e, 0);
  closeTo(result.modules.A5ConstructionKgCO2e, 20);
  closeTo(result.modules.A5PercentOfA1A4KgCO2e, 1);
  closeTo(result.modules.A5FossilKgCO2e, 21);

  // Total A5 = fossil + biogenic
  closeTo(result.modules.A5KgCO2e, 29.2);
});
});


it("derives m2 to m3 using thickness conversion", () => {
  const project: ProjectInput = {
    projectName: "Thickness test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "clt-test",
        name: "CLT test",
        boqQty: 10,
        boqUnit: "m2",
        declaredUnit: "m3",
        conversionMode: "thickness",
        conversionFactorToDeclaredUnit: 0,
        thicknessM: 0.12,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 100,
        massTonnesPerDeclaredUnit: 0.47,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
  allocatedManufacturingKgCO2e: 10,
  a4DistanceKm: 50,
},
    
    
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  closeTo(result.materials[0].declaredInstalledQty, 1.2);
});

it("derives m2 to kg using thickness_density conversion", () => {
  const project: ProjectInput = {
    projectName: "Thickness density test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "board-test",
        name: "Board test",
        boqQty: 10,
        boqUnit: "m2",
        declaredUnit: "kg",
        conversionMode: "thickness_density",
        conversionFactorToDeclaredUnit: 0,
        thicknessM: 0.015,
        densityKgPerM3: 800,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0.001,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
   factory: {
  allocatedManufacturingKgCO2e: 10,
  a4DistanceKm: 50,
},
    
    
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  closeTo(result.materials[0].declaredInstalledQty, 120);
});

it("derives m3 to tonne using density_only conversion", () => {
  const project: ProjectInput = {
    projectName: "Density only test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "timber-test",
        name: "Timber test",
        boqQty: 2,
        boqUnit: "m3",
        declaredUnit: "tonne",
        conversionMode: "density_only",
        conversionFactorToDeclaredUnit: 0,
        densityKgPerM3: 470,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 1,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
  allocatedManufacturingKgCO2e: 10,
  a4DistanceKm: 50,
},
    
    
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  closeTo(result.materials[0].declaredInstalledQty, 0.94);
});

it("derives count to kg using mass_per_item conversion", () => {
  const project: ProjectInput = {
    projectName: "Mass per item test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "fixings-test",
        name: "Fixings test",
        boqQty: 10,
        boqUnit: "nr",
        declaredUnit: "kg",
        conversionMode: "mass_per_item",
        conversionFactorToDeclaredUnit: 0,
        massKgPerItem: 0.35,
        itemsPerBoqUnit: 4,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0.001,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
  allocatedManufacturingKgCO2e: 10,
  a4DistanceKm: 50,
},
    
    
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);
  closeTo(result.materials[0].declaredInstalledQty, 14);
});

it("accepts unit aliases in the engine for area and volume units", () => {
  const project: ProjectInput = {
    projectName: "Alias units test",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "alias-line",
        name: "Alias line",
        boqQty: 10,
        boqUnit: "m²",
        declaredUnit: "m³",
        conversionMode: "manual",
        conversionFactorToDeclaredUnit: 0,
        thicknessM: 0.1,
        densityKgPerM3: 500,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
   
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);

  closeTo(result.materials[0].declaredInstalledQty, 1);
  closeTo(result.materials[0].deliveredToSiteMassTonnes, 0.5);
});

it("keeps a manual conversion override ahead of auto-derived conversion", () => {
  const project: ProjectInput = {
    projectName: "Manual conversion precedence",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "manual-wins",
        name: "Manual wins",
        boqQty: 10,
        boqUnit: "m2",
        declaredUnit: "kg",
        conversionMode: "manual",
        conversionFactorToDeclaredUnit: 20,
        thicknessM: 0.015,
        densityKgPerM3: 800,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);

  closeTo(result.materials[0].declaredInstalledQty, 200);
});

it("keeps auto-derived mass ahead of manual mass fallback when auto data exists", () => {
  const project: ProjectInput = {
    projectName: "Auto mass precedence",
    reportingAreaM2: 1,
    giaDemolishedM2: 0,
    referenceStudyPeriodYears: 50,
    assumptions: [],
    materials: [
      {
        id: "auto-mass-wins",
        name: "Auto mass wins",
        boqQty: 5,
        boqUnit: "m2",
        declaredUnit: "m2",
        conversionMode: "manual",
        conversionFactorToDeclaredUnit: 0,
        surfaceMassKgPerM2: 18,
        factoryWasteRate: 0,
        siteWasteRate: 0,
        epdA1A3KgCO2ePerDeclaredUnit: 1,
        massTonnesPerDeclaredUnit: 0.05,
        inboundDistanceKm: 0,
        inboundTransportKgCO2ePerTkm: 0,
        factoryWasteTransportDistanceKm: 0,
        factoryWasteTransportKgCO2ePerTkm: 0,
        factoryWasteTreatmentKgCO2ePerDeclaredUnit: 0,
        siteWasteTransportDistanceKm: 0,
        siteWasteTransportKgCO2ePerTkm: 0,
        siteWasteTreatmentKgCO2ePerDeclaredUnit: 0,
      },
    ],
    factory: {
      allocatedManufacturingKgCO2e: 0,
      a4DistanceKm: 0,
    },
    
    endOfLife: { c1KgCO2e: 0, routes: [] },
    
  };

  const result = calculateProject(project);

  closeTo(result.materials[0].deliveredToSiteMassTonnes, 0.09);
});
