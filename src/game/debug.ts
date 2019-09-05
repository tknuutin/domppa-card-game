
export const logF = (f: any, name: string) => {
  if (name.indexOf('_') === 0) {
    return f
  }
  return (...args: any[]) => {
    console.log(`IN (${name}):`, ...args)
    const ret = f(...args)
    console.log(`OUT (${name}):`, ret)
    return ret
  }
}