/**
 * requestAnimationFrame and cancel polyfill
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function rollercoasterSlider(element){



    var standardSettings = {
        hammerListeners:"swipeleft swiperight dragleft dragright dragend release dragup dragdown swipeup swipedown",
        minimap:true,
        lazyload:true
    };


    element = $(element);
    element = element.children(".section_wrapper");

    var self = this;
    var activeSection = 1;


    var paneWidth = 600;



    var paneCount = 0;
    var activePane = 0;

    var sectionCount = $(element).children("section").length;

    this.mergeOptions = function(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }


    this.init = function(settings){

        if(settings != undefined){settings = self.mergeOptions(standardSettings,settings);}
        else {settings = standardSettings;}

        element.parent("div").addClass("initialized");
        var i = 0;

        element.children('section').each(function(){
            var j =0; i++;
            if(i == 1){
                $(this).addClass("active");
                if($(this).children(".pane").length>1){element.parent("div").children('.navigation_item.right').addClass("active");}
            }

            $(this).attr("data-minimap-id",i);
            $(this).hammer({ show_touches: false, drag_lock_to_axis:true }).on(settings['hammerListeners'], function(event) {self.handleHammer(event);});

            $(this).children(".pane").each(function(){
                j++;
                $(this).attr("data-minimap-id",j);
                if(j==1){
                    $(this).addClass("active");
                }
                if(settings['lazyload'] == false){
                    $(this).css("background-image","url("+$(this).attr("data-background")+")");
                } else {
                    element.children("section:first-child").each(function(){
                        var sectionId = $(this).attr("data-minimap-id");
                        $(this).children(".pane").each(function(){
                            self.lazyload(sectionId,$(this).attr("data-minimap-id"));
                        });
                    });
                    element.children("section:nth-child(2)").each(function(){
                        var sectionId = $(this).attr("data-minimap-id");
                        $(this).children(".pane:first-child").each(function(){
                            self.lazyload(sectionId,$(this).attr("data-minimap-id"));
                        });
                    });
                }
            });

        });

        if(i > 1){element.parent("div").children('.navigation_item.down').addClass("active");}

        element.parent("div").children('.navigation_item.down').bind("click",function(){self.goDown();}).html("");
        element.parent("div").children('.navigation_item.up').bind("click",function(){self.goUp();}).html("");
        element.parent("div").children('.navigation_item.left').bind("click",function(){self.leftPane();}).html("");
        element.parent("div").children('.navigation_item.right').bind("click",function(){self.rightPane();}).html("");

        $(window).bind("resize",function(){self.handleResize();});

        self.handleResize();

        if(settings['minimap'] == true){self.minimapGenerator();}

    }

    this.lazyload = function(sectionId,paneId){
        element.children("section[data-minimap-id='"+sectionId+"']").children(".pane[data-minimap-id='"+paneId+"']").css("background-image","url("+element.children("section[data-minimap-id='"+sectionId+"']").children(".pane[data-minimap-id='"+paneId+"']").attr("data-background")+")"); /* Später Lazyload */
    }

    this.handleResize = function(){

        var refWidth = element.parent("div").width();
        var refHeight = element.parent("div").height();

        element.css("height",refHeight*element.children("section").length);
        element.children("section").css("height",refHeight);
        element.children("section").children(".pane").css("height",refHeight).css("width",refWidth);

        var i = 0;

        element.children("section").each(
            function(){
                var paneCount = $(this).children(".pane").length;
                paneWidth = $(this).children(".pane:first-child").width();
                $(this).css("width",paneCount*paneWidth+"px");
                $(this).css("margin-top",refHeight*i);
                i++;
            }
        );

    }

    this.handleHammer = function(event) {
        event.gesture.preventDefault();

        switch(event.type) {
            case 'swipeleft':
                self.rightPane();
                event.gesture.stopDetect();
                break;
            case 'swiperight':
                self.leftPane();
                event.gesture.stopDetect();
                break;
            case 'dragright':
            case 'dragleft':
                self.dragLeftRight(event);
                break;
            case 'release':
                self.releasePane(event);
                event.gesture.stopDetect();
                break;
            case 'swipedown':

                self.goUp();
                event.gesture.stopDetect();
                break;
            case 'swipeup':
                self.goDown();
                event.gesture.stopDetect();
                break;
            case "dragup":
            case "dragdown":
                self.dragUpDown(event);
                break;
        }

    }

    this.setContainerOffset = function(container,percentX,percentY,animate) {
        container.removeClass("animate");

        if(animate) {
            container.addClass("animate");
        }

        if(Modernizr.csstransforms3d) {
            container.css("transform", "translate3d("+ percentX +"%,"+percentY+"%,0) scale3d(1,1,1)");
        }

        else if(Modernizr.csstransforms) {
            container.css("transform", "translate("+ percentX +"%,"+percentY+"+)");
        }

        else {

            /* var paneCount = $("section#"+container.attr("id")+" .pane").length;
             var px = ((paneWidth*paneCount) / 100) * percentX;
             var py = ((pane_height*paneCount) / 100) * percentY;
             container.css("left", px+"px");
             container.css("top", py+"px");*/


        }

    }

    this.rightPane = function(times){

        if(times == undefined){times=1;}

        var activesectionId = $("section[data-minimap-id='"+activeSection+"']").attr("id");
        var paneCount = element.children("section.active").children(".pane").length;
        var currentPane = parseInt(element.children("section.active").children(".pane.active").attr("data-minimap-id"));
        var currentSection = parseInt(element.children("section.active").attr("data-minimap-id"));
        var offset = 0;

        if(currentPane+times <= paneCount){
            offset = -((100/paneCount)*(currentPane-1+times));
            currentPane = currentPane+times;

            element.children("section.active").children(".pane.active").removeClass("active");
            element.children("section.active").children(".pane[data-minimap-id='"+(currentPane)+"']").addClass("active");

        } else {
            offset = -((100/paneCount)*(currentPane-1));
        }

        if(currentPane < paneCount && paneCount > 1){
            element.parent("div").children('.navigation_item.right').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.right').removeClass("active");
        }

        if(currentPane > 1){
            element.parent("div").children('.navigation_item.left').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.left').removeClass("active");
        }



        self.setContainerOffset(element.children("section.active"),offset,0,true);
        self.minimapNavigate(currentPane,currentSection,true);

    }

    this.leftPane = function(times){

        if(times == undefined){times = 1;}

        var activesectionId = $("section[data-minimap-id='"+activeSection+"']").attr("id");
        var paneCount = element.children("section.active").children(".pane").length;
        var currentPane = parseInt(element.children("section.active").children(".pane.active").attr("data-minimap-id"));
        var offset = 0;
        var currentSection = parseInt(element.children("section.active").attr("data-minimap-id"));

        if(currentPane-times > 0){
            offset = -((100/paneCount)*(currentPane-times-1));
            currentPane = currentPane-times;

            element.children("section.active").children(".pane.active").removeClass("active");
            element.children("section.active").children(".pane[data-minimap-id='"+(currentPane)+"']").addClass("active");


        } else {
            offset = 0;
        }

        if(currentPane < paneCount && paneCount > 1){
            element.parent("div").children('.navigation_item.right').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.right').removeClass("active");
        }

        if(currentPane > 1){
            element.parent("div").children('.navigation_item.left').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.left').removeClass("active");
        }

        self.minimapNavigate(currentPane,currentSection,true);

        self.setContainerOffset(element.children("section.active"),offset,0,true);

    }

    this.goDown = function(times){
        if(times == undefined){times=1;}

        var container = element;
        var currentSection = parseInt(element.children("section.active").attr("data-minimap-id"));

        if(currentSection+1 <= sectionCount){
            element.children("section.active").removeClass("active");
            currentSection = currentSection+times;
            element.children("section[data-minimap-id='"+currentSection+"']").addClass("active");
        }

        element.children("section[data-minimap-id='"+currentSection+"']").each(function(){
            var sectionId = $(this).attr("data-minimap-id");
            $(this).children(".pane").each(function(){
                self.lazyload(sectionId,$(this).attr("data-minimap-id"));
            });
        });

        element.children("section[data-minimap-id='"+(currentSection+1)+"']").each(function(){
            var sectionId = $(this).attr("data-minimap-id");

            $(this).children(".pane:first-child").each(function(){
                self.lazyload(sectionId,$(this).attr("data-minimap-id"));
            });
        });


        if(currentSection>1){
            element.parent("div").children('.navigation_item.up').addClass("active");
        }

        if(currentSection < sectionCount){
            element.parent("div").children('.navigation_item.down').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.down').removeClass("active");
        }

        self.setContainerOffset(container,0,(-100/sectionCount)*(currentSection-1),true);

        var currentPane = element.children("section.active").children(".pane.active").attr("data-minimap-id");
        var paneCount = element.children("section.active").children(".pane").length;

        if(currentPane < paneCount && paneCount > 1){
            element.parent("div").children('.navigation_item.right').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.right').removeClass("active");
        }

        if(currentPane > 1){
            element.parent("div").children('.navigation_item.left').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.left').removeClass("active");
        }

        self.minimapNavigate(currentPane,currentSection,true);

    }

    this.goUp = function(times){

        if(times == undefined){times=1;}

        var container = element;
        var currentSection = parseInt(element.children("section.active").attr("data-minimap-id"));

        if(currentSection-times >= 1){
            element.children("section.active").removeClass("active");
            currentSection = currentSection-times;
            element.children("section[data-minimap-id='"+currentSection+"']").addClass("active");

        }

        if(currentSection>1){
            element.parent("div").children('.navigation_item.up').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.up').removeClass("active");
        }

        if(currentSection < sectionCount){
            element.parent("div").children('.navigation_item.down').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.down').removeClass("active");
        }

        self.setContainerOffset(container,0,(-100/sectionCount)*(currentSection-1),true);

        var currentPane = element.children("section.active").children(".pane.active").attr("data-minimap-id");
        var paneCount = element.children("section.active").children(".pane").length;

        if(currentPane < paneCount && paneCount > 1){
            element.parent("div").children('.navigation_item.right').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.right').removeClass("active");
        }

        if(currentPane > 1){
            element.parent("div").children('.navigation_item.left').addClass("active");
        } else {
            element.parent("div").children('.navigation_item.left').removeClass("active");
        }

        self.minimapNavigate(currentPane,currentSection,true);


    }

    this.dragLeftRight = function(event){

        var currentSection = element.children("section.active").attr("data-minimap-id");
        var paneCount = element.children("section.active").children(".pane").length;
        var currentPane = parseInt(element.children("section.active").children(".pane.active").attr("data-minimap-id"))-1;

        // stick to the finger
        var paneOffset = -(100/paneCount)*currentPane;
        var dragOffset = ((100/paneWidth)*event.gesture.deltaX) / paneCount;

        // slow down at the first and last pane
        if((currentPane == 0 && event.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            (currentPane == paneCount-1 && event.gesture.direction == Hammer.DIRECTION_LEFT)) {
            dragOffset *= .4;
        }

        self.setContainerOffset($("section[data-minimap-id="+currentSection+"]"),dragOffset + paneOffset,0,false);
    }

    this.dragUpDown = function(event){

        var currentSection = element.children("section.active").attr("data-minimap-id");

        var sectionOffset = -(100/sectionCount)*(currentSection-1);
        var dragOffset = ((100/$(window).height())*event.gesture.deltaY) / sectionCount;


        self.setContainerOffset(element,0,dragOffset + sectionOffset,false);

    }

    this.releasePane = function(event){

        var activesectionId = element.children("section.active").attr("id");

        var paneCount = element.children("section.active").children(".pane").length;
        var currentPane = parseInt(element.children("section.active").children(".pane.active").attr("data-minimap-id"));
        var currentSection = element.children("section.active").attr("data-minimap-id");

        if(event.gesture.direction == Hammer.DIRECTION_LEFT || event.gesture.direction == Hammer.DIRECTION_RIGHT){

            if(Math.abs(event.gesture.deltaX) > paneWidth/2) {

                if(event.gesture.direction == 'right') {
                    self.leftPane();
                } else {
                    self.rightPane();
                }
            }

            else {

                if(currentPane == 1){var offset = 0 ;}
                else {var offset =-(100/paneCount)*(currentPane-1);}

                self.setContainerOffset(element.children("section.active"),offset,0,true);

                element.children("section.active").children(".pane.active").removeClass("active");
                element.children("section.active").children(".pane[data-minimap-id='"+currentPane+"']").addClass("active");

            }

        } else {
            if(Math.abs(event.gesture.deltaY) > $(window).height()/4) {
                if(event.gesture.direction == "up"){
                    self.goDown();

                } else {
                    self.goUp();
                }

            } else {

                var offset =-(100/sectionCount)*(currentSection-1);
                self.setContainerOffset(element,0,offset,true);

            }

        }


    }

    this.minimapGenerator = function(){
        var output = "";

        element.parent("div").append("<div class='minimap'></div>");


        element.children("section").each(function(){

            var minimapId = $(this).attr("data-minimap-id");
            output += "<div class='vertical_section' data-minimap-id='"+minimapId+"'>";

            $(this).children(".pane").each(function(){
                output += "<div class='tile' data-section-id='"+minimapId+"' data-minimap-id='"+$(this).attr("data-minimap-id")+"'>"+$(this).attr("data-minimap-id")+"</div>";
            });

            output += "<div class='section_title'>"+$(this).attr("data-section-title")+"</div></div>";

        });

        element.parent("div").children(".minimap").append(output);

        element.parent("div").children(".minimap").children(".vertical_section:first-child").children(".tile:first-child").addClass("active");

        element.parent("div").children(".minimap").children("div.vertical_section").children(".tile").bind("click",function(){
            $(this).parent().parent().children(".vertical_section").children(".tile").removeClass("active");

            $(this).addClass("active");
            self.minimapNavigate($(this).attr("data-minimap-id"),$(this).attr("data-section-id"), false);
        });

    }

    this.minimapNavigate = function(minimapId,sectionId,setOnly){

        var currentSection = element.children("section.active").attr("data-minimap-id");
        var verticalCount = 0;
        var horizontalCount = 0;

        element.parent("div").children(".minimap").children(".vertical_section").children(".tile").removeClass("active");
        element.parent("div").children(".minimap").children(".vertical_section[data-minimap-id='"+sectionId+"']").children(".tile[data-minimap-id='"+minimapId+"']").addClass("active");

        if(currentSection>sectionId){
            verticalCount = currentSection-sectionId;
            if(!setOnly){self.goUp(verticalCount);}
        } else {
            verticalCount = sectionId-currentSection;
            if(!setOnly){self.goDown(verticalCount);}
        }

        var currentPane = element.children("section[data-minimap-id='"+sectionId+"']").children(".pane.active").attr("data-minimap-id");

        if(currentPane>minimapId){
            horizontalCount = currentPane-minimapId;
            if(!setOnly){self.leftPane(horizontalCount);}
        } else {
            horizontalCount = minimapId-currentPane;
            if(!setOnly){self.rightPane(horizontalCount);}
        }

    }

}