export function snakeToCamel(str: any) {
  var parts = str.split("_");
  return parts.reduce(function (p: any, c: any) {
    return p + c.charAt(0).toUpperCase() + c.slice(1);
  }, parts.shift());
}

export function toCamelCase(object: any, options: any = {}) {
  if (
    typeof object !== "object" ||
    toString.call(object) === "[object Array]" ||
    object === null
  ) {
    return object;
  }

  const { attributes = [], whitelist = false, rootOnly = false } = options;

  return Object.keys(object).reduce(function (p: any, key) {
    const inList = attributes.indexOf(key) !== -1;
    var newKey: any =
      (inList && whitelist) || (!inList && !whitelist)
        ? snakeToCamel(key)
        : key;
    p[newKey] = rootOnly ? object[key] : toCamelCase(object[key]);
    return p;
  }, {});
}
