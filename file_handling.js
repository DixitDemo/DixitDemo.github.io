var files = {};
var images = document.getElementById('images');
var default_images = document.getElementById('default_images');
function edit(){
    $('#use_frame').prop('disabled', true);
    $('#default_images').prop('hidden', false);
    $('.sep_story').prop('hidden', true);
    $('.usedFrameList').prop('hidden', true);
}

function submit(){
    console.log('click submit');

    // remove previous state
    for (index=1; index <= 5; index ++){
        var usedFrameList = document.getElementById('usedFrameList'+String(index));
        while (usedFrameList.firstChild) {
            usedFrameList.removeChild(usedFrameList.firstChild);
        }
    }
    for (index=1; index <= 5; index ++){
        var sep_story = document.getElementById('sep_story'+String(index));
        sep_story.innerHTML = "";
    }

    // order files
    var childs = document.getElementById("images").childNodes;
    var arr = []
    if (childs.length != 5) {
        alert("Must use 5 images");
        return;
    }
    for (let index=0; index < childs.length; index ++) {
        child = childs[index];
        console.log('child', child);
        if (child.id.startsWith("default")) {
            var img = document.getElementById(child.id);
            arr.push(child.src);
        }
        else {
            arr.push(files[child.id]);
        }
    }
    console.log(arr)
    
    socket.emit("img", arr);
    $('#use_frame').prop('disabled', false);
    $('#default_images').prop('hidden', true);
    $('.sep_story').removeAttr('hidden');
    $('.usedFrameList').removeAttr('hidden');
    
    $("#waiting_img").css("display", "block");
    $("#wrapper").css('opacity', 0.25);
    
    
}

var default_images_content = document.getElementById("default_images_content");
$("document").ready(function(){
    // it's global
    default_imgs = Array.from(document.getElementById("default_images_content").childNodes);
    console.log('in loaded default_imgs', default_imgs);
    
});

$("#clear_img").on("click", function(){
    console.log('click clear');
    while (images.firstChild) {
        images.removeChild(images.firstChild);
    }
    console.log("initial usualFrame");
    clear_area("all")
    initial_usualFrame();
    var tmp_ul = document.getElementById("tmp_ul1");
    //console.log('tmp_ul in clear', tmp_ul);
    while (tmp_ul.firstChild) {
        tmp_ul.removeChild(tmp_ul.firstChild);
    }
    var tmp_ul = document.getElementById("tmp_ul2");
    //console.log('tmp_ul in clear', tmp_ul);
    while (tmp_ul.firstChild) {
        tmp_ul.removeChild(tmp_ul.firstChild);
    }
    files = {};
    while (default_images_content.firstChild) {
        default_images_content.removeChild(default_images_content.firstChild);
    }
    console.log("default_imgs", default_imgs);
    put_image_pool();
    $('#use_frame').prop('disabled', true);
    $('#default_images').prop('hidden', false);
    $('.sep_story').prop('hidden', true);
    $('.usedFrameList').prop('hidden', true);
});


var sortable_images = Sortable.create(images, 
    {
        group: {
            name: images, 
            pull: true, 
            put: true
        }, 
        
    
    });

var sortable_default = Sortable.create(default_images_content, 
    {
        group: {
            name: images, 
            pull: true, 
            put: true
        }, 
        
    
    });

var choose = document.getElementById('choose');
FileAPI.event.on(choose, 'change', function (evt){
    console.log('event on choose!');
    tmp_files = FileAPI.getFiles(evt); // Retrieve file list
    console.log(tmp_files);

    FileAPI.filterFiles(
        tmp_files, 
        function (file, info/**Object*/){
            if( /^image/.test(file.type) ){
                return  true;
            }
            return  false;
        }, 
        function (tmp_files/**Array*/, rejected/**Array*/){
            // Make preview size x size;
            
            FileAPI.each(tmp_files, function (file){
                //files.push(file);
                console.log(files);
                var size = (document.getElementById("images").clientWidth) / 6;
                if (size > 178) {
                    size = 178;
                }
                console.log('size', size);
                console.log(file);
                FileAPI.Image(file).resize(size, size, 'max').get(function (err, img){
                    
                    console.log('err', err);
                        
                    console.log(img);
                    console.log(document.getElementById("images").childNodes);
                    index = Object.keys(files).length;
                    img.id = String(index);
                    files[String(index)] = file;
                    
                    var images = document.getElementById("images");
                    images.appendChild(img);
                });
            });
            document.getElementById("choose").value = "";
            
        }
    );
});
