19/******************
 * GOBALA VARIABLER
 *****************/

var datum;
var cors=0; //cross-origin verkar inte vara aktiverat och origin-headern skickas inte via Internet Explorer från intranätet. Det gör den dock via Chrome. För att få båda att fungera måste dessa skiljas åt. cors=1 om IE och cors=2 om chrome.
//Laddad dagens datum
idag = new Date($.now());

datum = idag.getFullYear() + '-' + ('0' + (idag.getMonth() + 1)).slice(-2) + '-' + ('0' + (idag.getDate())).slice(-2);
//datum = "2018-02-19";

var date = new Date(datum);

var sourceurl = 'http://famlarsson.net/telefon/';
//var sourceurl = 'http://intern.lvn.se/Upload/Startsidor/Specialistvården/Operation och IVA/Sundsvall/telefonomkoppling/';
var schemaurl = 'https://schema.medinet.se/sundanopiva/schema/sibirien/';
//schemaurl = 'http://dev.ml.dnsd.info/';
var _HELGID = "day-18-";
var helg = false;
var _BJOUR = "day-20-";
var _PJOUR = "day-19-";
var obj;





	/*För att komma runt 'Access-Control-Allow-Origin' problemet används en proxy adress
	enligt instruktionerna på 
	https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
	*/

var proxy = 'https://cors-anywhere.herokuapp.com/';
var finalSchemaURL = schemaurl;

/*************************
 * SLUT GLOBALA VARIABLER
*************************/

/****************************************
 * LADDAR FUNKTIONER UR funktioner.xml
 * **************************************/

function laddaFunktioner($){
    
    	$.ajax({
		type: "GET",
		url: sourceurl+"funktioner.xml",
		dataType: "xml",
		crossDomain: true,
		success: function(xml){ 
			$(xml).find('funktion').each(function(){
				var funktion = $(this).find('namn').text();
				var telefonnr = $(this).find('telefonnr').text();
				var medinetrad = $(this).find('medinetrad').text();
				var kortfunktion = $(this).find('kort').text();
				var ishelg = $(this).find('helg').text();
				$("<tr id='"+medinetrad+"' funktion='"+kortfunktion+"' helg='"+ishelg+"' class='class_medinetrad'></tr>").html("<td class='class_funktion'>"+funktion + ", " + telefonnr + "</td><td class='class_medarbetare'><select id="+kortfunktion+"></select></td><td class='class_status'></td>").appendTo("#funktioner tbody");
			});
			console.log("Laddar medarbetare...");
			laddaMedarbetare($);
			console.log("Funktioner laddade.");
		},
		error: function() { alert("Ett fel uppstod vid laddning av funktioner.xml"); }
    	});
}

/*************************
 * SLUT LADDA FUNKTIONER
*************************/

/****************************************
 * LADDAR MEDARBETARE UR medarbetare.xml
 * **************************************/
function laddaMedarbetare($){
    
    $("<option short='ANNAN'></option>").html("ANNAN").appendTo("select");
    
    $.ajax({
		type: "GET",
		url: sourceurl+"medarbetare.xml",
		dataType: "xml",
		crossDomain: true,
		success: function(xml){ 
			$(xml).find('medarbetare').each(function(){
				var namn = $(this).find('namn').text();
				var short = $(this).find('short').text();
				$("<option short='"+short+"'></option>").html(namn+" ("+short+")").appendTo("select");
			});
			console.log("Medarbetare laddade.");
			console.log("Laddar schema...");
			laddaSchema($);
		},
		error: function() { alert("Ett fel uppstod vid laddning av funktioner.xml"); }
    	});
    
    
    
}

/*************************
 * SLUT LADDA MEDARBETARE
*************************/

/****************************************
 * LADDAR SCHEMA FRÅN MEDINET
 * **************************************/


function laddaSchema($){
    
    
	
	console.log("Adress till schema: "+finalSchemaURL);
	
		$.ajax({
		url: finalSchemaURL,
		type: 'GET',
		crossDomain: true,
		success: function(result) { console.log("Schema laddat."); schemaSync($,result);  },
		error: function() { alert("Kunde inte ladda schemat"); },
		dataType: 'html'

	
	});
}
/*************************
 * SLUT LADDA SCHEMA
*************************/

/****************************************
 * SYNKRONISERAR SCHEMA 
 * **************************************/

function schemaSync($,res){
    console.log("Synkroniserar schemat med funktioner och medarbetare...");
    
    var initialer="0";
    var sokid;
    obj=res;
    
    //Kollar om det är vardag eller helg
    if($(res).find('#'+_HELGID+datum).text() == String.fromCharCode(160)){
        console.log("Helgjour Längd: "+$(res).find('#'+_HELGID+datum).length);
        console.log("Vardag");
        helg=false;
    }
    else{
        console.log("Helgjour Längd: "+$(res).find('#'+_HELGID+datum).length);
        helg = true;
    }
    
    //Söker i varje funktion och letar ut och posten för respektive funktion ur schemat och extraherar initialerna på medarbetarens om innehar den posten dagens datum.
    $("tr[class='class_medinetrad']").each(function(){ 
        sokid=$(this).attr('id')+datum;
        initialer=$(res).find('#'+sokid).text();
        console.log(sokid+" "+initialer);

        //Lägger till initialerna på de som inte finns i listand för att se vad som står i Medinet
        if(initialer != String.fromCharCode(160)){
            if($(this).find("[short='"+initialer+"']").length == 0) $(this).find(".class_medarbetare").append(" ("+initialer+")");
            $(this).find("[short='"+initialer+"']").attr("selected","selected");
        }
        else
            console.log("Hittade ingen medarbetare");
      
      //Tar bort poster som inte är aktuella på helgen
      console.log($(this).attr('helg'));
       if(helg && $(this).attr('helg') != "Ja"){
           $(this).remove();
       }
       if(helg == false && $(this).attr('helg') == "Ja") $(this).remove(); //Ta bort helgjourer om det är Vardag
       if((date.getDay() == 5) && $(this).attr('helg') == "Ej Fredag") $(this).remove(); //Ta bort de som ej skall vara på fredagar om det är fredag
       if((date.getDay() != 5) && $(this).attr('helg') == "Fredag") $(this).remove(); //Ta bort de som bara skall vara på fredagar om ej är fredag
       

       
      
 
        
    });
    console.log("Schemat synktoniserat med funktioner och medarbetare.");
    $("select").change(function(){
        console.log("Select changing...");
        laddaLankar();
    });
    console.log("Laddar genvägar för omkoppling...");
    laddaLankar();
    
}

/*************************
 * SLUT SYNKRONISERA SCHEMA
*************************/

/****************************************
 * LADDA LÄNKAR
 * **************************************/

function laddaLankar(){

$.ajax({
		type: "GET",
		url: sourceurl+"telefon.xml",
		dataType: "xml",
		crossDomain: true,
		success: function(xml){ 
			console.log("Telefoner.xml laddad");
			var medinetid = "";
			
			$("#funktionstabell tr").each(function(){
			    medinetid = $(this).attr('id');
			    funktionid = $(this).attr('funktion');
			    userid = $(this).find('option:selected').attr('short');
			    //if(helg) userid = userid+"-H";
			    //if(!helg && date.getDay() == 5 && (medinetid == _BJOUR || medinetid == _PJOUR)) userid=userid+"-F";
	
			    
			    console.log(medinetid+" "+userid);
			    var telefonnode = $(xml).find("telefon kortnamn:contains("+funktionid+")").parent();
			    var vidarenode = $(telefonnode).find("initialer:contains("+userid+")").parent();
			    var genvag = $(vidarenode).find("genvag").text();
			    
			    if (genvag != ""){
			        $(this).find(".class_status").html(genvag);
			        console.log(genvag);
			        status_color($(this).find(".class_status"), "yellow");
			    }
			    else{
			        console.log("Ingen genväg finns inlagd");
			        $(this).find(".class_status").html("Ingen genväg finns inlagd");
			        status_color($(this).find(".class_status"), "red");
			    }
			  
	
			    
			});
			
			
			console.log("Kopplar funktion till länk");
		},
		error: function() { alert("Ett fel uppstod vid laddning av telefoner.xml"); }
    	});
    
}

/*************************
 * SLUT LADDA LÄNKAR
*************************/

function status_color(status_node, color){
    $(status_node).removeClass("class_status_red");
     $(status_node).prev().removeClass("class_status_red");
      $(status_node).prev().prev().removeClass("class_status_red");
    $(status_node).removeClass("class_status_yellow");
     $(status_node).prev().removeClass("class_status_yellow");
      $(status_node).prev().prev().removeClass("class_status_yellow");    
    $(status_node).removeClass("class_status_green");
     $(status_node).prev().removeClass("class_status_green");
      $(status_node).prev().prev().removeClass("class_status_green");
  $(status_node).removeClass("class_status_darkgreen");
     $(status_node).prev().removeClass("class_status_darkgreen");
      $(status_node).prev().prev().removeClass("class_status_darkgreen");
  $(status_node).removeClass("class_status_orange");
     $(status_node).prev().removeClass("class_status_orange");
      $(status_node).prev().prev().removeClass("class_status_orange");
    
    
    $(status_node).addClass("class_status_"+color);
    $(status_node).prev().addClass("class_status_"+color);
    $(status_node).prev().prev().addClass("class_status_"+color);
    
}

//Här är ingången!
$(document).ready(function(){

//För att avgöra om det krävs crossDomain request
	$.ajax({
	    url: schemaurl,
	    type: 'GET',
	    crossDomain: true,
	    dataType: 'html',
	    success: function(){cors=1;},
	    error: function(){cors=2; finalSchemaURL = proxy + schemaurl;} 
	});
	
	//Formatera dagens datum

	console.log("Dagens datum: "+datum);
	console.log("Dag i veckan: "+date.getDay());
	$("<p></p>").html("Hämtat från Medinet: "+datum).prependTo("#funktioner");
	
	//while(cors==0){}
	
	console.log("Laddar funktioner...");
	laddaFunktioner($);

	$("#send").click(function(){
	    alert("Begäran är skickad. Avvakta svar från växeln");
	    
	//Skicka kopplingsbegäran för varje aktiv post
	    $(".class_status:contains('http://')").each(function(){
        var element = $(this);
	  
	  
	//Ta bort gamla vidarekopplingar här
	  
	//Ta bort kommentaren för att aktiviera vidarekopplingsfunktionen
	         
	        $.ajax({
	        url: $(this).text(),
	        type: 'GET',
	        dataType: 'html',
	        crossDomain: true,
	        success: function(xml){ 
	            if(cors==1){
	                if($(xml).find('*:contains("Din snabbknapp har nu aktiverats")').length != 0){
    	                console.log("Bekräftelse mottagen för: "+element.text())
    	                status_color(element, "darkgreen");
	                }
	                else {
	                    console.log("Bekräftelse skickad men bekräftelse stämmer ej överrens: "+element.text())
    	                status_color(element, "orange");
	                }
	                
	            }
	            
	        },
	        error: function(jqXHR, exception) {
	            status_color(element, "green");
	            console.log("Begäran är skickad, men det går ej få bekräftelse");}
	        
            });
    
	    });
	});

	
	
});

