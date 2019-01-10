var frameToImgAndDescription = {};


var usualFrameList1 = document.getElementById('usualFrameList1');
//console.log(originalUsualFrameChildObj);
var sortable_usual_l = Sortable.create(usualFrameList1, 
    {
        group: {
            name: "frameGroup", 
            pull: true, 
            put: true
        }, 
        

    });

var usualFrameList2 = document.getElementById('usualFrameList2');
//console.log(originalUsualFrameChildObj);
var sortable_usual_2 = Sortable.create(usualFrameList2, 
    {
        group: {
            name: "frameGroup", 
            pull: true, 
            put: true
        }, 
        

    });

var originalUsualFrameChildObj1;
var originalUsualFrameChildObj2;

var index;
for (index=1; index <= 5; index ++){
    var usedFrameList = document.getElementById('usedFrameList'+String(index));
    var sortable_used_l = Sortable.create(usedFrameList, 
        {
            group: {
                name: "frameGroup", 
                pull: true, 
                put: true
            }, 
            
        
        });
}
var tmp_ul = document.getElementById("tmp_ul1");
//console.log(tmp_ul);
var tmp_ul = Sortable.create(tmp_ul, 
    {
        group: {
            name: "frameGroup", 
            pull: true, 
            put: true
        }, 
        

    });
var tmp_ul = document.getElementById("tmp_ul2");
//console.log(tmp_ul);
var tmp_ul = Sortable.create(tmp_ul, 
    {
        group: {
            name: "frameGroup", 
            pull: true, 
            put: true
        }, 
        

    });


function initial_usualFrame(){
    while(usualFrameList1.firstChild){
        usualFrameList1.removeChild(usualFrameList1.firstChild);
    }
    while(usualFrameList2.firstChild){
        usualFrameList2.removeChild(usualFrameList2.firstChild);
    }
    var index;
    for(index=0; index < originalUsualFrameChildObj1.length; index++){
        var child = originalUsualFrameChildObj1[index];
        usualFrameList1.appendChild(child);
    }
    for(index=0; index < originalUsualFrameChildObj2.length; index++){
        var child = originalUsualFrameChildObj2[index];
        usualFrameList2.appendChild(child);
    }
}

function color_frame(frame) {
    var li = document.createElement("li");
    li.className += "list-group-item";
    tokens = frame.split("_");
    var new_frame = [];
    for (var index=0; index<tokens.length-1; index++){
        new_frame.push(tokens[index]);
    }
    new_frame = new_frame.join("_");
    if (tokens[tokens.length-1] == "NOUN") {
        li.className += " noun_type";
    } 
    else {
        li.className += " frame_type";
    }
    if (new_frame.length > 10){
        li.className += " small_font_terms";
    }
    li.appendChild(document.createTextNode(String(new_frame)));
    
    return li;
}

function bind_li(li) {
    //console.log(li);
    $(li).hover(function(){
        //console.log("hover on", this);
        var description_area = document.getElementById("description_show_area");
        if (li.classList.contains("noun_type")) {
            for (let img of frameToImgAndDescription[this.innerHTML]["images"]) {
                var img_ele = document.createElement("img");
                img_ele.src = get_image_src(img);
                img_ele.style="height: 12.5vh";
                description_area.appendChild(img_ele);
            }
        }
        else if (li.classList.contains("frame_type")) {
            description_area.innerHTML = frameToImgAndDescription[this.innerHTML]["description"];
        }
    }, function(){
        var description_area = document.getElementById("description_show_area");
        while (description_area.lastChild) {
            //console.log(description_area.lastChild);
            description_area.removeChild(description_area.lastChild);
        }
    });
    //console.log('end of adding hover', li);
    return li;
}

function distributed_put_frame(usual_frames, l1, l2) {
    for (var i = 0; i < usual_frames.length; i++) {
        //console.log(usual_frames[i]);
        var frame = usual_frames[i]['name'];
        var images = usual_frames[i]['image'];
        var description = usual_frames[i]['description'];
        if(description == ""){
            description = "No description."
        }
        li = color_frame(frame);
        frameToImgAndDescription[li.innerHTML] = {
            'images': images, 
            'description': description
        };
        li = bind_li(li);
        if (i % 2 == 0){
            l1.appendChild(li);
        }
        else {
            l2.appendChild(li);
        }
        fitty('.li', {maxSize: 16});
    }
}
var enc = new TextDecoder("utf-8");
function get_image_src(image) {  
    var arrayBufferView = new Int8Array( image );
    return 'data:image/jpg;base64,' + enc.decode(arrayBufferView);      
}


/* IO is written below */

// receiving frames after giving image
socket.on('frames', function (frameObjLists){
    $("#waiting_img").css("display", "none");
    $("#wrapper").css('opacity', 1);
    clear_area(area="all");
    initial_usualFrame();

    // frameLists is list of list of frame
    //console.log('receive frameLists:', frameObjLists);
    var i;
    for (i=1; i<=frameObjLists.length; i++){
        //console.log('i', i);
        frameList = document.getElementById('usedFrameList'+String(i));
        for (const frameObj of frameObjLists[i-1]){
            //console.log('frameObj', frameObj);
            var frame = frameObj['name'];
            var hover_images = frameObj['image'];
            var description = frameObj['description'];
            if(description == ""){
                description = "No description."
            }
            //console.log('frame is', frame);
            li = color_frame(frame);
            frameToImgAndDescription[li.innerHTML] = {
                'images': hover_images, 
                'description': description
            };
            li = bind_li(li);
            frameList.appendChild(li);
        } 
    }
});


// sending frames to server
function use_frame(){
    //console.log('click use frame');

    // check if frames number valid
    //console.log(usedFrameList.childNodes.length);
    
    var usedFrameStores = []
    var index;
    for (index=1; index<=5; index++){
        tmp_arr = []
        usedFrameList = document.getElementById("usedFrameList"+String(index));
        for (const usedFrameLi of usedFrameList.getElementsByTagName("li")){
            usedFrame = usedFrameLi.innerHTML.split('<div>')[0];
            if (usedFrameLi.classList.contains("noun_type")) {
                usedFrame += "_NOUN";
            }
            else if (usedFrameLi.classList.contains("frame_type")) {
                usedFrame += "_Frame";
            }
            //console.log('usedFrameLi', usedFrameLi);
            //console.log('usedFrame', usedFrame);
            tmp_arr.push(usedFrame);
        }
        usedFrameStores.push(tmp_arr);
    }
    socket.emit("frames", usedFrameStores);
    $("#waiting_img_down").css("display", "block");
    $("#wrapper").css('opacity', 0.25);
    
}

function get_usual_frame() {
    //console.log("getting usual Frames");
    socket.emit("usual_frame", {}, function(recv){
        //console.log(recv);
        var l1 = document.getElementById("usualFrameList1");
        var l2 = document.getElementById("usualFrameList2");
        distributed_put_frame(recv, l1, l2);
        originalUsualFrameChildObj1 = $.extend(true, {}, usualFrameList1.getElementsByTagName("li"));
        originalUsualFrameChildObj2 = $.extend(true, {}, usualFrameList2.getElementsByTagName("li"));
    });
}

function search(){
    if (!document.getElementById("search_text").value) {
        initial_usualFrame();
        return;
    }
    clear_area("usualFrame");
    //console.log("click search");
    
    var query = document.getElementById("search_text").value;
    //console.log("query is", query);
    socket.emit("search", String(query), function(result){
        //console.log('result is', result);
        var l1 = document.getElementById("usualFrameList1");
        var l2 = document.getElementById("usualFrameList2");
        distributed_put_frame(result, l1, l2);
    });   
}
$("#search_text").on('input', function() {
    if (!this.value) {
        clear_area("usualFrame");
        initial_usualFrame();
    }
    //!this.value ...
});

$("document").ready(function(){
    get_usual_frame();
    
});
