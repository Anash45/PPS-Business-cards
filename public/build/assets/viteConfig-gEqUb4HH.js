async function a(){return(await(await fetch("/get-link-url")).json()).link_url}export{a as g};
