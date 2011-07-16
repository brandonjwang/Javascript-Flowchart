/*

          Author: Brandon Wang
         Purpose: Generates elements in a flow graph
    Requirements: JQuery or a packed version
	     License: Meh.
   
*/
//Generates a random string
function randomString(length, chars) {
   
    if (length==null) {length=8;}
    if (chars==null) {chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";}
    var randomstring = '';
    for (var i=0; i<length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

//Library for creating a flow chart
function flowchart ( mydiv ) {
   
    //Setting up variables
    this.mydiv = mydiv;
    this.height = this.mydiv.offsetHeight;
    this.width = this.mydiv.offsetWidth;
    this.top = this.mydiv.offsetTop;
    this.left = this.mydiv.offsetLeft;
    this.connArray = [];
    this.existConns = [];
    this.nodelist = [];
    this.nodestyle = "background-color : #f5f5f5; border : 2px solid #739ABD;";
    this.selectstyle = "background-color : #ffffff; border : 2px solid #739ABD;";
    this.linestyle = "background-color : #000000;";
   
    //Draws a line, either horizontal or vertical starting at (x, y). If hor=true, then it draws a horizontal line
    this.drawLine = function (x, y, len, hor) {
        myline = document.createElement('div');
        myline.setAttribute("style", this.linestyle);
        myline.className="line";
        myline.style.position="absolute";
        myline.style.visibility="visible";
        if (hor == true) {
            myline.style.left=x+"px";
            myline.style.top=y+"px";
            myline.style.width=len+"px";
            myline.style.height="1px";
        } else {

            myline.style.left=x+"px";
            myline.style.top=y+"px";
            myline.style.width="1px";
            myline.style.height=len+"px";
        }
        document.body.appendChild(myline)
    };
	
    this.redrawConns = function () {
        $(".line").remove();
        for (var i=0; i<this.existConns.length; i++){
            this.drawConn(this.existConns[i][0], this.existConns[i][1]);
        }
    };

    //Draws node and includes node style (in css)
    this.drawNode = function (x, y, width, height, draggable, selectable) {
        uid = randomString();
            mynode = document.createElement('div');
            mynode.id=uid;
            mynode.className="node";
            mynode.setAttribute("style", this.nodestyle);
            mynode.style.position="absolute";
            mynode.style.visibility="visible";
            mynode.style.left=x+"px";
            mynode.style.top=y+"px";
            mynode.style.width=width+"px";
            mynode.style.height=height+"px";
            mynode.style.overflow="auto";
            document.body.appendChild(mynode);
       
        //Gets required CSS accordingly
        function getreq(div) {
            return "position:absolute;visibility:visible;left:"+div.style.left+";top:"+div.style.top+";width:"+div.style.width+";height:"+div.style.height+";";
        }
        if (selectable) {
            $("#"+uid).data("selected", false);
            myname = this;
            $("#"+uid).bind("click", function (e) {
                jself = $("#"+uid);
                if (jself.data("selected")==false) {
                    jself.data("selected", true);
                    this.setAttribute("style" , myname.selectstyle+getreq(this));
                    tmplen = myname.connArray.push(this);
                    if (tmplen==2) {
                        myname.drawConn(myname.connArray[0], myname.connArray[1]);
                        myname.existConns.push([myname.connArray[0], myname.connArray[1]])
                        myname.connArray[0].setAttribute("style", myname.nodestyle+getreq(myname.connArray[0]));
                        myname.connArray[1].setAttribute("style", myname.nodestyle+getreq(myname.connArray[1]));
                        $("#"+myname.connArray[0].id).data("selected", false);
                        $("#"+myname.connArray[1].id).data("selected", false);
                        myname.connArray=[];
                       
                    } else {
                        if (tmplen > 2) {
                            unselect = myname.connArray.shift();
                            $("#"+unselect).data("selected", false);
                            unselectsetAttribute("style", myname.nodestyle+getreq(unselect));
                        }
                    }
                } else {
                    jself.data("selected", false);
                    this.setAttribute("style", myname.nodestyle+getreq(this));
                    for (var k=0; k<myname.connArray.length; k++) {
                        myname.connArray[k] == this ? myname.connArray = myname.connArray.slice(0, k-1).concat(myname.connArray.slice(k+1, myname.connArray.length)) : "";
                    }
                }
            });
        }
       
        if (draggable) {
            divref = $('#'+this.mydiv.id);
            $("#"+uid).draggable({containment : divref});
			$("#"+uid).bind("mousemove", {self : this} , function(e){e.data.self.redrawConns()});
        }
       
        this.nodelist.push($("#"+uid)[0]);
       
        return $("#"+uid)[0];
    };
   
    //Change node drag options outlined in the jQuery UI documentation
    this.chnodeDrag = function (newdrag) {
        $(".node").draggable("destroy");
        $(".node").draggable( newdrag );
    };
    //Finds the distance between 2 points given in the format of:
    //[[x1, y1], [x2, y2]]
    this.dist = function (pts) {
        dx=pts[0][0]-pts[1][0];
        dy=pts[0][1]-pts[1][1];
        return Math.sqrt(dx*dx+dy*dy)
    }
   
    //Returns 2 (x,y) based on the shortest distance from 2 divs.
    //The 2 points have to be one of:
    /*   +----3.Here----+
     *   |              |
     * 1.Here          2.Here
     *   |              |
     *   +----4.Here----+
     *  
    */
    this.nodeConn = function (div1, div2) {
        //Compare all 8 possible points
        var divonexys = [[div1.offsetLeft, div1.offsetTop+Math.round(div1.offsetHeight/2)]]; //1
        divonexys.push( [div1.offsetLeft+div1.offsetWidth, div1.offsetTop+Math.round(div1.offsetHeight/2)] ); //2
        divonexys.push( [div1.offsetLeft+Math.round(div1.offsetWidth/2), div1.offsetTop] ); //3
        divonexys.push( [div1.offsetLeft+Math.round(div1.offsetWidth/2), div1.offsetTop+div1.offsetHeight] ); //4
        var divtwoxys = [[div2.offsetLeft, div2.offsetTop+Math.round(div2.offsetHeight/2)]];
        divtwoxys.push( [div2.offsetLeft+div2.offsetWidth, div2.offsetTop+Math.round(div2.offsetHeight/2)] );
        divtwoxys.push( [div2.offsetLeft+Math.round(div2.offsetWidth/2), div2.offsetTop] );
        divtwoxys.push( [div2.offsetLeft+Math.round(div2.offsetWidth/2), div2.offsetTop+div2.offsetHeight] );
        pts = [divonexys[0], divtwoxys[0]];
        curdist = this.dist(pts);
        for (var i=0; i<4; i++) {
            for (var j=0; j<4; j++) {
                tmpdist=this.dist([divonexys[i], divtwoxys[j]]);
                if (curdist>tmpdist) {
                    pts=[divonexys[i], divtwoxys[j]];
                    curdist=tmpdist;
                }
            }
        }
        //returns in the format of [[x1, y1], [x2, y2]] in integer format
        return pts;
    };
   
    //Draws a connection between 2 divs based on the closest distance
    this.drawConn = function (div1, div2) {
        pts = this.nodeConn(div1, div2);
        //Determine whether to start with a vertical line/horizontal line
        if (pts[0][1]==div1.offsetTop+Math.round(div1.offsetHeight/2)) {
            var div1hor=true;
        } else {
            var div1hor=false;
        }
       
        //Determine whether to end with a vertical line/horizontal line
        if (pts[1][1]==div2.offsetTop+Math.round(div2.offsetHeight/2)) {
            var div2hor=true;
        } else {
            var div2hor=false;
        }
       
        //Draw the connection (good luck reading the following chunk of code)
        if (div1hor==div2hor) {
        //3 lines are required
            if (div1hor==true) {
                pts[1][1]<pts[0][1] ? y=pts[1][1] : y=pts[0][1];
                midlen=Math.round(Math.abs(pts[0][0]-pts[1][0])/2);
                if (pts[0][0]<pts[1][0]) {
                    this.drawLine(pts[0][0], pts[0][1], midlen, true);
                    this.drawLine(pts[1][0]-midlen, y, Math.abs(pts[0][1]-pts[1][1]), false);
                    this.drawLine(pts[1][0]-midlen, pts[1][1], midlen, true);
                } else {
                    this.drawLine(pts[1][0], pts[1][1], midlen, true);
                    this.drawLine(pts[0][0]-midlen, y, Math.abs(pts[0][1]-pts[1][1]), false);
                    this.drawLine(pts[0][0]-midlen, pts[0][1], midlen, true);
                }
            } else {
                pts[0][0]<pts[1][0] ? x=pts[0][0] : x=pts[1][0];
                midlen=Math.round(Math.abs(pts[0][1]-pts[1][1])/2);
                if (pts[0][1]<pts[1][1]) {
                    this.drawLine(pts[0][0], pts[0][1], midlen, false);
                    this.drawLine(x, pts[0][1]+midlen, Math.abs(pts[0][0]-pts[1][0]), true);
                    this.drawLine(pts[1][0], pts[1][1]-midlen, midlen, false);
                } else {
                    this.drawLine(pts[1][0], pts[1][1], midlen, false);
                    this.drawLine(x, pts[1][1]+midlen, Math.abs(pts[0][0]-pts[1][0]), true);
                    this.drawLine(pts[0][0], pts[0][1]-midlen, midlen, false);
                }
            }
        } else {
        //2 lines are required   
            if (div1hor==true) {
                if (pts[0][1]<pts[1][1]) {
                    y1 = pts[0][1];
                    y2 = pts[0][1];
                    if (pts[0][0] < pts[1][0]) {
                        x1 = pts[0][0];
                        x2 = pts[1][0];
                    } else {
                        x1 = pts[1][0];
                        x2 = pts[1][0];
                    }
                } else {
                    y1 = pts[0][1];
                    y2 = pts[1][1];
                    if (pts[0][0]<pts[1][0]) {
                        x1 = pts[0][0];
                        x2 = pts[1][0];
                    } else {
                        x1 = pts[1][0];
                        x2 = pts[1][0];
                    }
                }
               

               
                this.drawLine(x1, y1, Math.abs(pts[0][0]-pts[1][0]), true);
                this.drawLine(x2, y2, Math.abs(pts[0][1]-pts[1][1]), false);
            } else {
                if (pts[0][1]<pts[1][1]) {
                    y2 = pts[0][1];
                    y1 = pts[0][1];
                    if (pts[0][0] < pts[1][0]) {
                        x2 = pts[0][0];
                        x1 = pts[1][0];
                    } else {
                        x2 = pts[0][0];
                        x1 = pts[0][0];
                    }
                } else {
                    y2 = pts[0][1];
                    y1 = pts[1][1];
                    if (pts[0][0]<pts[1][0]) {
                        x2 = pts[1][0];
                        x1 = pts[1][0];
                    } else {
                        x2 = pts[0][0];
                        x1 = pts[0][0];
                    }
                }
               

               
                this.drawLine(x1, y1, Math.abs(pts[0][0]-pts[1][0]), false);
                this.drawLine(x2, y2, Math.abs(pts[0][1]-pts[1][1]), true);
            }
        }
    };
}
