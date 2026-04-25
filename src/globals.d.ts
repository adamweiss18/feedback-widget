declare module "*.css" {
  const css: string;
  export default css;
}

declare const process: {
  env: Record<string, string | undefined>;
};
