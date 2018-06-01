
var $xml;


function MlXmlTable(fileName, nodeName, options)  {
    //MlXmlTable variables
    this.XML_FILE_ERROR = "Filen kunder inte laddas";
    var _parent = this;
    this.fileName = ( typeof fileName !== 'undefined') ? fileName : "NO_FILE";
    this.nodeName = ( typeof nodeName !== 'undefined') ? nodeName : "NO_NODENAME";
    this.options = (typeof options !== 'undefined') ? options : {id:"mxt-container", class:"table-striped"};
    var $xml;
    
    this.loadXML = function(){
        console.log("Laddar filen: "+fileName);
        $.ajax({
            type:           "GET",
            url:            fileName,
            dataType:       "xml",
            success:        function(xmlData){
                console.log("Fillen laddades!");
                var totalNodes = $(xmlData).find(_parent.nodeName).length // count XML nodes
                _parent.$xml = $(xmlData);
                console.log("Totalt finns "+totalNodes+" noder");
                _parent.createTable();
                
                },
            error:          function(){
                console.log(_parent.XML_FILE_ERROR);
            }
        
        });
    }
    
    this.createTable = function(){
        var tclass = _parent.options.class;
        _parent.$xmlTable = $("<table class='table "+tclass+"'></table>");
        _parent.$xmlTable.append("<thead><tr id='mxt-head-row'></tr></thead>");
        _parent.$xmlTable.append("<tbody></tbody>");
        $("#mxt-container").empty().append(_parent.$xmlTable);
        
        _parent.$xml.find(_parent.nodeName).first().children().each(function(){
                    console.log($(this)[0].tagName);
                    $("#mxt-head-row").append("<th>"+$(this)[0].tagName+"</th>");
                });
                var i=0;
                _parent.$xml.find("funktion").each(function(){
                    $('tbody').append('<tr></tr>');
                    $(this).children().each(function(){
                        $('tbody').find('tr:last').append('<th>'+$(this).text()+'</th>');
                        
                    });
                });
    }
    
    this.loadXML();
}


$(document).ready(function(){
    console.log("Sidan är nu laddad");
    //LoadXML("funktioner.xml", "funktion");
    var funk = new MlXmlTable("funktioner.xml", "funktion");
    
    
    
})