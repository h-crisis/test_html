/**
 * Created by manabu on 2016/05/21.
 */

var styleHospital = new ol.style.Style({
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif'
    }),
    image: new ol.style.Icon({
        scale: 0.2,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.85,
        src: "hospital.png"
    })
});