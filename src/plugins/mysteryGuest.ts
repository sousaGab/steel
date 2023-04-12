import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from '../util';
import Rule from "../rule";

class External {
  constructor(public name: string, public alias: string) { }
}

const mysteryMethods = [
  { module: 'fs', method: 'access' },
  { module: 'fs', method: 'readFile' },
  { module: 'fs', method: 'readFileSync' },
  { module: 'fs', method: 'exists' },
  { module: 'fs', method: 'existsSync' },
  { module: 'fs', method: 'unlink' },
  { module: 'fs', method: 'unlinkSync' },
  { module: 'http', method: 'get' },
  { module: 'http', method: 'request' },
];

const mysteryModules = ['fs', 'http'];

let modules: External[] = [];

export default class MysteryGuestRule extends Rule {

  get name(): string {
    return "Mystery Guest";
  }

  private hasMysteryMethodCalled(node: any, moduleName: string, methodName: string): boolean {
    return node.object.name === moduleName
      && node.property.name === methodName;
  }

  private hasMysteryModuleRequired(node: any, module: string): boolean {
    return node.type === "VariableDeclaration"
      && node.declarations[0].init !== null
      && node.declarations[0].init.type === "CallExpression"
      && node.declarations[0].init.callee.name === "require"
      && node.declarations[0].init.arguments[0].value === module;
  }

  private hasMysteryModuleImported(node: any, module: string): boolean {
    return node.type === "ImportDeclaration"
      && node.source.value === module;
  }

  private findRequires(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      enter: (path: any) => {
        const node = path.node;
        mysteryModules.forEach(item => {
          if (this.hasMysteryModuleRequired(node, item)) {
            modules.push(new External(item, node.declarations[0].id.name));
          }
          if (this.hasMysteryModuleImported(node, item)) {
            modules.push(new External(item, node.specifiers[0].local.name));
          }
        });
      },
    });
    return results;
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    this.findRequires(ast)
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            MemberExpression: (path: any) => {
              modules.forEach(mdl => {
                const filterModule = (item: any) => item.module === mdl.name;
                mysteryMethods.filter(filterModule).forEach(item => {
                  if (this.hasMysteryMethodCalled(path.node, mdl.alias, item.method)) {
                    results.push(new Smell(path.node.loc.start));
                  }
                });
              });
            }
          });
        }
      },
    });
    return results;
  }
}
