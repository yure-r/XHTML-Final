const fetch = require("node-fetch");  

exports.cleanseString = (str) => {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

exports.isValidJSON = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

// exports.aggregator = async ()=> {
//   const aggregator = process.env.AGGREGATOR ? process.env.AGGREGATOR : 'https://cooper-union-aggregator.glitch.me/aggregate'
//   return await fetch(`${aggregator}?origin=${process.env.PROJECT_DOMAIN}`).then(response => response.json()).catch(e=>{})
// }