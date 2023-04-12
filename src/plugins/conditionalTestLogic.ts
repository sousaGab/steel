import { File, CallExpression, isArrayExpression, isMemberExpression, isIdentifier } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import Rule from "../rule";

export default class ConditionalTestLogicRule extends Rule {
  get name(): string {
    return 'Conditional Test Logic'
  };

  get module(): string {
    return 'ConditionalTestLogicRule'
  };

  private isForEach(node: CallExpression): boolean {
    return isMemberExpression(node.callee)
      && isArrayExpression(node.callee.object)
      && isIdentifier(node.callee.property)
      && node.callee.property.name === "forEach";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    const newSmell = (loc: any) =>
      results.push(new Smell(loc.start));
    traverse(ast, {
      IfStatement: (path: any) => { newSmell(path.node.loc); },
      ForStatement: (path: any) => { newSmell(path.node.loc); },
      ForInStatement: (path: any) => { newSmell(path.node.loc); },
      ForOfStatement: (path: any) => { newSmell(path.node.loc); },
      WhileStatement: (path: any) => { newSmell(path.node.loc); },
      SwitchStatement: (path: any) => { newSmell(path.node.loc); },
      CallExpression: (path: any) => {
        if (this.isForEach(path.node)) {
          newSmell(path.node.callee.property.loc);
        }
      }
    });
    return results;
  }
}
