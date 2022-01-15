const axios = require('axios');
let cheerio = require('cheerio');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const request = require('request');
const { next } = require('cheerio/lib/api/traversing');
const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('output.pdf'));

var a, b, c;
createBinder();

async function createBinder() {
    let birdies = fs.readFileSync('birdies.json');
    let birds = JSON.parse(birdies);
    for(i=0; i<birds.length; ++i) {
        await addBird(birds[i]);
    }
    doc.end();
}

async function addBird(link) {
    console.log(link);
    await axios.get(link)
        .then((response) => {
            if(response.status === 200) {
            a = response.data;
        }
    }, (error) => console.log(err) );

    await axios.get(`${link}/id`)
        .then((response) => {
            if(response.status === 200) {
                b = response.data;  
        }
    }, (error) => console.log(err) );

    await axios.get(`${link}/lifehistory`)
        .then((response) => {
            if(response.status === 200) {
                c = response.data;  
        }
    }, (error) => console.log(err) );

    /* Overview Page */
    var $ = cheerio.load(a); 
    let birdName = $(".species-name")[0].children[0].data;
    let scientificName = $(".species-info")[0].children[1].children[0].data;
    let order = $(".additional-info")[0].children[0].children[1].data;
    let family = $(".additional-info")[0].children[1].children[1].data;
    let basicDescription = "None";
    if($(".callout")[0].next.children[1].children[0]) {
        basicDescription = $(".callout")[0].next.children[1].children[0].data;
    }
    let conservationStatus = $(".conservation")[0].next.childNodes[1].childNodes[0].data;
    let migrationMap = $(".narrow-content")[0].childNodes[0].childNodes[0].childNodes[0].attribs["data-interchange"];
    migrationMap = migrationMap.slice(1, migrationMap.indexOf(".jpg")+4);
    let coolFacts = "";
    for(r=0; r<$(".accordion-content")[0].childNodes[0].childNodes.length; ++r) {
        if($(".accordion-content")[0].childNodes[0].childNodes[r].type != "text") {
            coolFacts += `\n -> ${$(".accordion-content")[0].childNodes[0].childNodes[r].childNodes[0].data}`;
        } 
    } 

    /* Bird ID */
    $ = cheerio.load(b); 
    let birdImages = [];
    let birdType = [];
    let birdDescription = [];
    for(j=0; j<$(".slider")[0].childNodes.length; ++j) {
        if($(".slider")[0].childNodes[j].childNodes[0].childNodes[0].name == 'img') {
            let birdImage = $(".slider")[0].childNodes[j].childNodes[0].childNodes[0].attribs["data-interchange"];
            birdImage = birdImage.slice(1, birdImage.indexOf(".jpg")+4);
            birdImages.push(birdImage);
            let birdTyp = "None";
            if($(".slider")[0].childNodes[j].childNodes[0].childNodes[1].childNodes[0].childNodes[0]) {
                birdTyp = $(".slider")[0].childNodes[j].childNodes[0].childNodes[1].childNodes[0].childNodes[0].data;
            }
            let birdDes = "None";
            if($(".slider")[0].childNodes[j].childNodes[0].childNodes[1].childNodes[1]) {
                if($(".slider")[0].childNodes[j].childNodes[0].childNodes[1].childNodes[1].childNodes[0]) {
                    birdDes = $(".slider")[0].childNodes[j].childNodes[0].childNodes[1].childNodes[1].childNodes[0].data;
                }
            }
            birdType.push(birdTyp);
            birdDescription.push(birdDes);
        }
    }
    var birdLength, birdWeight;
    if($(".add-info")[0].childNodes[1].childNodes[0].childNodes[0]) {
         birdLength = $(".add-info")[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].data;
         birdWeight = $(".add-info")[0].childNodes[1].childNodes[0].childNodes[1].childNodes[0].data;
    }
    let wingSpan = "";
    if($(".add-info")[0].childNodes[1].childNodes[0].childNodes[2] != undefined) {
        wingSpan = $(".add-info")[0].childNodes[1].childNodes[0].childNodes[2].childNodes[0].data;
    } 
    let colorPattern = "None";
    if($(".accordion-content")[1]) {
        if($(".accordion-content")[1].childNodes[0].childNodes[0].childNodes[0]) {
            colorPattern = $(".accordion-content")[1].childNodes[0].childNodes[0].childNodes[0].data;
           }
    }
    
    
    /* Bird Information */
    var habitat = "", food, nestPlacement, nestDescription, infoNesting = "", behavior, conservation = "";
    $ = cheerio.load(c);
    try {
        if($(".category-content")[0].childNodes[0].childNodes[1].childNodes[1]) {
            habitat = $(".category-content")[0].childNodes[0].childNodes[1].childNodes[1].data;
            food = $(".category-content")[0].childNodes[1].childNodes[1].childNodes[1].data;
           nestPlacement = $(".category-content")[0].childNodes[2].childNodes[2].childNodes[1].data;
           nestDescription = $(".category-content")[0].childNodes[2].childNodes[4].childNodes[0].data;
           for(q=0; q<$(".category-content")[0].childNodes[2].childNodes[6].childNodes[0].childNodes[0].childNodes.length; q++) {
               infoNesting += "\n\n" + $(".category-content")[0].childNodes[2].childNodes[6].childNodes[0].childNodes[0].childNodes[q].childNodes[0].childNodes[0].data + " " + 
               $(".category-content")[0].childNodes[2].childNodes[6].childNodes[0].childNodes[0].childNodes[q].childNodes[1].childNodes[0].data;
           }
           behavior = $(".category-content")[0].childNodes[3].childNodes[1].childNodes[1].data;
            conservation = $(".category-content")[0].childNodes[4].childNodes[1].childNodes[1].data;
            infoNesting += "\n\n" + "Nest Placement: " +  nestPlacement + "\n\n" + "Nest Description: " +  nestDescription;
       } else {
           habitat = $(".category-content")[0].childNodes[2].childNodes[0].data;
           food = $(".category-content")[0].childNodes[3].childNodes[0].data;
          nestPlacement = $(".category-content")[0].childNodes[2].childNodes[3].childNodes[0].data;
          nestDescription = $(".category-content")[0].childNodes[2].childNodes[8].childNodes[0].data;
          for(q=0; q<$(".category-content")[0].childNodes[2].childNodes[11].childNodes[0].childNodes[0].childNodes.length; q++) {
           infoNesting += "\n\n" + $(".category-content")[0].childNodes[2].childNodes[11].childNodes[0].childNodes[0].childNodes[q].childNodes[0].childNodes[0].data + " " + 
           $(".category-content")[0].childNodes[2].childNodes[11].childNodes[0].childNodes[0].childNodes[q].childNodes[1].childNodes[0].data;
          }
          behavior = $(".category-content")[0].childNodes[3].childNodes[2].childNodes[0].data;
           conservation = $(".category-content")[0].childNodes[4].childNodes[2].childNodes[0].data;
           infoNesting += "\n\n" + "Nest Placement: " +  nestPlacement + "\n\n" + "Nest Description: " +  nestDescription;
       }
    } catch(e) {}
    if($(".category-content")[0].childNodes[0].childNodes[1].childNodes.length != 3) {
        habitat = $(".category-content")[0].childNodes[0].childNodes[2].childNodes[0].data;
    } else {
        habitat = $(".category-content")[0].childNodes[0].childNodes[1].childNodes[1].data;
    }
    if($(".category-content")[0].childNodes[1].childNodes[1].childNodes.length != 3) {
        food = $(".category-content")[0].childNodes[1].childNodes[2].childNodes[0].data;
    } else {
        food = $(".category-content")[0].childNodes[1].childNodes[1].childNodes[1].data;
    }
    doc
        .fontSize(30)
        .text(birdName, 30, 35);
    doc
        .fontSize(20)
        .fillColor('grey')
        .text("Bird Characteristics", 30); doc.text("\n");
    doc
        .fontSize(12)
        .fillColor('black')
        .text("Scientific Name: " + scientificName, 35); doc.text("\n");
    doc
        .fontSize(12)
        .text("Order: " + order);doc.text("\n");
    doc
        .fontSize(12)
        .text("Family Name: " + family); doc.text("\n");
    doc
        .fontSize(12)
        .text("Conservation Status: " + conservationStatus); doc.text("\n");
        doc
        .fontSize(12)
        .text(birdLength); doc.text("\n");
        doc
        .fontSize(12)
        .text(birdWeight); doc.text("\n");
        doc
        .fontSize(12)
        .text(wingSpan); doc.text("\n");
    doc
        .fontSize(12)
        .text("Basic Description: " + basicDescription); doc.text("\n");
    doc
        .fontSize(20)
        .fillColor('grey')
        .text("Nesting Characteristics", 30);
    doc
        .fontSize(12)
        .fillColor('black')
        .text(infoNesting,35); doc.text("\n");
    doc
        .fontSize(20)
        .fillColor('grey')
        .text("Bird Information", 30); doc.text("\n");
    doc
        .fontSize(12)
        .fillColor('black')
        .text("Habitat: " + habitat, 35); doc.text("\n");
        doc
        .fontSize(12)
        .fillColor('black')
        .text("Food: " + food, 35); doc.text("\n");
        doc
        .fontSize(12)
        .fillColor('black')
        .text("Behavior: " + behavior, 35); doc.text("\n");
        doc
        .fontSize(12)
        .fillColor('black')
        .text("Conservation: " + conservation, 35); doc.text("\n");
        doc
        .fontSize(12)
        .fillColor('black')
        .text("Color Pattern: " + colorPattern, 35); doc.text("\n");
        doc
        .fontSize(20)
        .fillColor('grey')
        .text("Fun Facts", 30); doc.text("\n");
        doc
        .fontSize(12)
        .fillColor('black')
        .text(coolFacts, 35); doc.text("\n");
        doc.addPage();
        doc
        .fontSize(20)
        .fillColor('grey')
        .text("Migration Map", 30); doc.text("\n");
        let url = migrationMap;
        let res = await addMigrationMap(url);
        doc.text("\n")
        doc.fontSize(12).fillColor('black').text("Violet = Year Round \nPeach = Breeding \nYellow = Migration \nBlue = Nonbreeding")
        doc.addPage();
        doc
        .fontSize(20)
        .fillColor('grey')
        .text("Birdies", 30); doc.text("\n");
    
        for(m=0; m<birdImages.length; ++m){
            //console.log(birdImages[m]);
            var resA = await addBirdA(birdImages[m]);
            doc.text("\n");
            doc
            .fontSize(15)
            .fillColor('black')
            .text(birdType[m], 35); 
            doc
            .fontSize(15)
            .fillColor('black')
            .text(birdDescription[m], 35);
            doc.text("\n");
        }
        
    doc.addPage(); // Create New Page
}

function addMigrationMap(url) {
    return new Promise(function (resolve, reject) {
      request({ url, encoding: null }, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            var img = Buffer.from(body, 'base64');
            doc.image(img, {width: 200, align: 'center',valign: 'center'});
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  }

function addBirdA(url) {
    return new Promise(function (resolve, reject) {
        request({ url, encoding: null }, function (error, res, body) {
          if (!error && res.statusCode == 200) {
              var img = Buffer.from(body, 'base64');
              doc.image(img, {width: 150, align: 'center',valign: 'center'});
            resolve(body);
          } else {
            reject(error);
          }
        });
      })
}
  