var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 1
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    }),
    image: new ol.style.Icon({
        scale: 0.9,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.85,
        src: "http://h-crisis.niph.go.jp/assistant/wp-content/uploads/sites/4/2016/04/pictograms12.png"
    })
});
var style1 = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 1
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    }),
    image: new ol.style.Icon({
        scale: 0.2 ,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.85,
        src: "http://h-crisis.niph.go.jp/assistant/wp-content/uploads/sites/4/2016/04/Hospital.png"
    })
});
var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'http://h-crisis.niph.go.jp/assistant/wp-content/uploads/sites/4/2016/04/kumamoto_0419.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function(feature, resolution) {
        if(feature.get('二次医療圏').match(/熊本/)) {
            style1.getText().setText(resolution < 10 ? feature.get('名称') : '');
            return style1;
        } else {
            style.getText().setText(resolution < 10 ? feature.get('名称') : '');
            return style;
        }
    }
});
var map = new ol.Map({
    layers: [ new ol.layer.Tile({source:
        new ol.source.XYZ({
            url : 'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
            attributions: [
                new ol.Attribution({
                    html: "<a href='http://www.gsi.go.jp/' target='_blank'>国土地理院</a>"})
            ],
            title: "地理院地図"
        })}),
        vectorLayer
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.transform([130.611129, 32.787558,13], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12
    })
});
var additionalmapOsm = new ol.source.OSM();
var osmLayer = new ol.layer.Tile({ source: additionalmapOsm });
var osmOnOff   = document.getElementById('osm-vis');
osmOnOff.addEventListener('click', function (e) {
    if (osmLayer.getVisible()) {
        osmLayer.setVisible(false);
    } else {
        osmLayer.setVisible(true);
    }
});
map.addLayer(osmLayer);
osmLayer.setVisible(false);
var additionalmapQuest = new ol.source.MapQuest({ layer: 'sat' });
var questLayer = new ol.layer.Tile({ source: additionalmapQuest });
var questOnOff   = document.getElementById('quest-vis');
questOnOff.addEventListener('click', function (e) {
    if (questLayer.getVisible()) {
        questLayer.setVisible(false);
    } else {
        questLayer.setVisible(true);
    }
});
map.addLayer(questLayer);
questLayer.setVisible(false);
var highlightStyleCache = {};
var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: function(feature, resolution) {
        var text = resolution < 5000 ? feature.get('名称') : '';
        if (!highlightStyleCache[text]) {
            highlightStyleCache[text] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.1)'
                }),
                text: new ol.style.Text({
                    font: '12px Calibri,sans-serif',
                    text: text,
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 3
                    })
                })
            });
        }
        return highlightStyleCache[text];
    }
});
var highlight;
var displayFeatureInfo = function(pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
    });
    var info = document.getElementById('info');
    if (feature) {
        info.innerHTML =
            "避難所コード:" + feature.get('避難所コー') + '<br>' +
            "避難所名    :" + feature.get('名称') + '<br>' +
            "郵便番号    :" + feature.get('郵便番号') + '<br>' +
            "住所        :" + feature.get('住所') + '<br>' +
            "二次医療圏   :" + feature.get('二次医療圏');
    } else {
        info.innerHTML = '&nbsp;';
    }
    if (feature !== highlight) {
        if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
        }
        if (feature) {
            featureOverlay.getSource().addFeature(feature);
        }
        highlight = feature;
    }
};
var overlayHinan = new ol.Overlay({
    element: document.getElementById('overlayHinan'),
    positioning: 'bottom-center'
});
var overlayHosp = new ol.Overlay({
    element: document.getElementById('overlayHosp'),
    positioning: 'bottom-center'
});
map.on('click', function(evt) {
    if (evt.dragging) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});
map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);
    var coordinate = evt.coordinate;
    var pixel = map.getPixelFromCoordinate(coordinate);
    var labelB = '';
    var labelC = '';
    var labelD = '';
    var labelE = '';
    map.forEachFeatureAtPixel(pixel, function(feature){
        labelB = feature.get('名称');
        labelC = feature.get('郵便番号');
        labelD = feature.get('住所');
        labelE = feature.get('二次医療圏');
    });
    if (labelE.match(/熊本/)) {
        overlayHosp.setPosition();
        map.addOverlay(overlayHosp);
        var element = overlayHinan.getElement();
        element.innerHTML =
            "避難所名    :" + labelB + '<br>' +
            "郵便番号    :" + labelC + '<br>' +
            "住所        :" + labelD;
        overlayHinan.setPosition(coordinate);
        map.addOverlay(overlayHinan);
    } else if (labelB.length > 0) {
        overlayHosp.setPosition();
        map.addOverlay(overlayHosp);
        var element = overlayHinan.getElement();
        element.innerHTML =
            "避難所名    :" + labelB + '<br>' +
            "住所    :" + labelC + '<br>' +
            "二次医療圏        :" + labelE;
        overlayHinan.setPosition(coordinate);
        map.addOverlay(overlayHinan);
    } else {
        overlayHinan.setPosition();
        map.addOverlay(overlayHinan);
    }
});
map.on('pointermove', function(evt) {
    if (evt.dragging) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.forEachLayerAtPixel(pixel, function() {
        return true;
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});