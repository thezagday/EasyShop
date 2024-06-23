import '../css/bootstrap.min.css';
import '../css/templatemo-style.css';
import '../fontawesome/css/all.min.css';
import '../css/seadragon.css';

// Change this to the path to your "_files" directory on the remote server.
var dziFilesUrl = '//openseadragon.github.io/example-images/duomo/duomo_files/';

// Change this to the contents of the .dzi file from your server.
var dziData = '<?xml version="1.0" encoding="utf-8"?><Image TileSize="254" Overlap="1" Format="jpg" xmlns="http://schemas.microsoft.com/deepzoom/2008"><Size Width="13920" Height="10200"/></Image>';

// This converts the XML into a DZI tile source specification object that OpenSeadragon understands.
var tileSourceFromData = function(data, filesUrl) {
    var $xml = $($.parseXML(data));
    var $image = $xml.find('Image');
    var $size = $xml.find('Size');

    var dzi = {
        Image: {
            xmlns: $image.attr('xmlns'),
            Url: filesUrl,
            Format: $image.attr('Format'),
            Overlap: $image.attr('Overlap'),
            TileSize: $image.attr('TileSize'),
            Size: {
                Height: $size.attr('Height'),
                Width: $size.attr('Width')
            }
        }
    };

    console.log(dzi);
    return dzi;
};

// This creates the actual viewer.
var viewer = OpenSeadragon({
    id: 'viewer',
    prefixUrl: '//openseadragon.github.io/openseadragon/images/',
    tileSources: tileSourceFromData(dziData, dziFilesUrl)
});