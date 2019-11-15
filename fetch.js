// JavaScript Document
const response = await fetch('https://statsapi.web.nhl.com/api/v1/schedule?teamId=15&startDate=2019-10-01&endDate=2020-04-04');
const myJson = await response.json();
console.log(JSON.stringify(myJson));