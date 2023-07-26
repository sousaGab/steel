import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import Rule from "../rule";

export default class GlobalVariableRule extends Rule {
  get name(): string {
    return 'Global Variable'
  };

  get module(): string {
    return 'GlobalVariableRule'
  };

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      VariableDeclaration: (path: any) => {
        if (path.node.kind === "var" && path.node.name !== 'this') {
          results.push(new Smell(path.node.loc.start));
        }
      }
    });
    return results;
  }
}

