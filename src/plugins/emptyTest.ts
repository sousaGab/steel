import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from "../util";
import Rule from "../rule";

export default class EmptyTestRule extends Rule {

  get name(): string {
    return "Empty Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          // const testCase = node.arguments[0].value;
          const arrowFunction = node.arguments[1].body;
          const hasBody = !!arrowFunction.body;
          if ((hasBody && arrowFunction.body.length === 0) ||
            arrowFunction.innerComments) {
            results.push(new Smell(node.loc.start));
          }
        }
      }
    });
    return results;
  }
}
