import path from "path";
import Module from "module";

const projectRoot: string = path.resolve(__dirname, "..");
const distRoot: string = path.resolve(projectRoot, "dist");

type ResolveFilename = (
  request: string,
  parent: NodeModule | null,
  isMain: boolean,
  options: unknown
) => string;

const originalResolveFilename: ResolveFilename = (
  Module as unknown as {
    _resolveFilename: ResolveFilename;
  }
)._resolveFilename;

(Module as unknown as { _resolveFilename: ResolveFilename })._resolveFilename =
  function (
    request: string,
    parent: NodeModule | null,
    isMain: boolean,
    options: unknown
  ) {
    if (request.startsWith("@/")) {
      const subPath: string = request.substring(2);
      request = path.join(distRoot, subPath);
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  };
