import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isAssertion, isChaiBdd, isLiteralTypes, isRedundantArguments, isChaiAssert, isJest, isTestCase } from "../util";
import { isIdentifier } from "@babel/types";
import Rule from "../rule";

export default class RedundantAssertionRule extends Rule {

  get name(): string {
    return "Redundant Assertion";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            CallExpression: (path: any) => {
              const node = path.node;
              if ((isAssertion(node) || isChaiAssert(node))
                && isLiteralTypes(node.arguments[0])
                && isRedundantArguments(node.arguments[0], node.arguments[0])) {
                results.push(new Smell(node.loc.start));
              }
              else if (isChaiBdd(node) || isJest(node)) {
                path.traverse({
                  CallExpression: (innerPath: any) => {
                    const innerNode = innerPath.node;
                    if (isIdentifier(innerNode.callee)
                      && innerNode.callee.name === "expect"
                      && isLiteralTypes(innerNode.arguments[0])
                      && isRedundantArguments(innerNode.arguments[0], node.arguments[0])) {
                      results.push(new Smell(node.loc.start));
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
    return results;
  }
}
