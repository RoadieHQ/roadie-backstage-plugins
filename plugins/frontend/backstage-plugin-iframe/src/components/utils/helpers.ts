

export const determineError = (src: string, allowList: string[]|undefined) => {
  if(!src || src === ""){
    return "No src field provided. Please pass it in as a prop to populate the iframe."
  }
  else if(src && allowList && !allowList.includes(new URL(src).hostname)){
    return `Src ${src} for Iframe is not included in the allowlist ${allowList.join(",")}.`
  }
  return '';
}