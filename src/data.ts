import { basename } from "path";
import { Detection, Report } from "./types";
import { getNumberOfTestMethods } from "./util";

const escomplexModule = require('typhonjs-escomplex-module');

export function processData(detections: Detection[]): Report {
  const notEmpty = (item: Detection) => item.result.length > 0;
  const smelledTestSuites = detections.filter(notEmpty);
  const data = smelledTestSuites.map(item => {
    return {
      path: item.suite.path,
      // testSuites: ,
      testCases: getNumberOfTestMethods(item.suite.ast),
      // smelledTestCases: ,
      smells: item.smells,
      smellInfo: item.result,
      metrics: escomplexModule.analyze(item.suite.ast),
    }
  });

  return {
    project: basename(process.cwd()),
    testSuites: detections.length,
    testCases: data.map(item => item.testCases).reduce((sum, val) => sum + val),
    smelledTestSuites: data.length,
    smelledTestCases: 0,
    smells: smelledTestSuites.flatMap(item => item.smells).reduce((acc, cur) => acc + cur),
    smelledFiles: data
  }
}
