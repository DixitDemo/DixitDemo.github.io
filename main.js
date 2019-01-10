document.getElementById("sep_story_content").clientWidth = document.getElementById("images").clientWidth;

function clear_area(area) {
    if (area == 'all' || area == "usedFrame"){
        for (let i = 1; i <= 5; i++){
            var usedFrameListi = document.getElementById("usedFrameList"+String(i));
            while (usedFrameListi.firstChild) {
                usedFrameListi.removeChild(usedFrameListi.firstChild);
            }
        }   
    }
    if (area == "all" || area == "usualFrame") {
        while(usualFrameList1.firstChild){
            usualFrameList1.removeChild(usualFrameList1.firstChild);
        }
        while(usualFrameList2.firstChild){
            usualFrameList2.removeChild(usualFrameList2.firstChild);
        }
    }
    if (area == "all" || area == "story") { 
        for (index=1; index <= 5; index ++){
            var sep_story = document.getElementById('sep_story'+String(index));
            sep_story.innerHTML = "";
        }
    }

    if (area == "all") {
        $("#submit_star").prop("disabled", true);
        $("#modify_story").prop("disabled", true);
        put_image_pool();
    }
}

review_star = 5;

$("label").on("click", function(e){
    console.log("label click");
    review_star = parseInt(this.title);
    console.log("click star", review_star);
})

$("#submit_star").on("click", function(e){
    console.log("click submit star");
    console.log("star is", review_star);
    
    var spans = $("span");
    console.log(spans);
    storys = new Array(5)
    for (var i=0; i<spans.length; i++){
        story = spans[i].innerHTML;
        console.log("now story:", story);
        storys[i] = story;
    }
    socket.emit("star", {"star":review_star, "storys": storys});
    e.preventDefault();
    alert("We receive your review!");
});

$("#modify_done").on("click", function(e){
    console.log("click modify done");
    $("span").removeAttr("contenteditable");
    $("span").removeClass("editable");
    $("#modify_done").prop("hidden", true);
    $("#modify_story").removeAttr('hidden');
    $("#submit_star").removeAttr('disabled');
    e.preventDefault();
});

$("#modify_story").on("click", function(e){
    console.log("click modify story");
    $("span").prop("contenteditable", true);
    $("span").addClass("editable");
    $("#modify_done").removeAttr('hidden');
    $("#modify_story").prop("hidden", true);
    $("#submit_star").prop("disabled", true);
    e.preventDefault();
});

$("#search_text").on("keypress", function(e){
    if (e.keyCode == 13) {
        $("#search_button").click();
    }
});

// receiving story after giving frames
socket.on('story', function (storys){
    $("#waiting_img_down").css("display", "none");
    $("#wrapper").css('opacity', 1);
    console.log('receive storys:', storys);
    var index;
    var story_arr = [];
    for (index=1; index <= storys.length; index++){
        story = storys[index-1]
        var story_area = document.getElementById("sep_story"+String(index));
        story_area.innerHTML = story;
        story_arr.push(story);
    }
    $("#submit_star").removeAttr('disabled');
    $("#modify_story").removeAttr('disabled');
});

function sign_in() {
    $("#sign_in_window").css('display', 'in-block');
    $("#wrapper").css('opacity', 0.25);

}

/*
$("#send_name").on('click', function (){
    var user_name = document.getElementById("user_name").value;
    if (user_name === ""){
        $("#sign_in_window").append("<p style='color: red;'>Please type youe name above</p>")
    }
    else{
        $("#sign_in_window").css('display', 'none');
        $("#wrapper").css('opacity', 1);
    
        console.log('user_name', user_name);
        socket.emit("user_name", user_name);
    }
    
})
*/

/*
const user_name_input = document.getElementById("user_name");
user_name_input.addEventListener("keyup", function(event) {
    console.log("in key up event is", event);
    if (event.key === "Enter") {
        // Do work
        var user_name = document.getElementById("user_name").value;
        if (user_name === ""){
            $("#sign_in_window").append("<p style='color: red;'>Please type youe name above</p>")
        }
        else{
            $("#sign_in_window").css('display', 'none');
            $("#wrapper").css('opacity', 1);
    
            console.log('user_name', user_name);
            socket.emit("user_name", user_name);
        }

    }
});
*/

function put_image_pool(){
    default_image = document.getElementById("default_images_content");
    for (var i=0; i<=27; i++){
        var dimg = document.createElement("img");
        dimg.setAttribute('src', 'default_images/'+i.toString()+'.jpg');
        dimg.setAttribute('id', 'default_images/'+i.toString()+'.jpg');
        var size = (document.getElementById("images").clientWidth) / 6;
        if (size > 178) {
            size = 178;
        }
        dimg.setAttribute('height', size.toString());
        dimg.setAttribute('width', size.toString());
        default_image.append(dimg);
    }
}

function logging(action) {
    console.log("logging", action);
    socket.emit("log", action);
}

$("document").ready(function(){
    while (images.firstChild) {
        images.removeChild(images.firstChild);
    }
    //name = sign_in()
    put_image_pool()
    
});
