// below is image part
function add(){
    $("#input_images").css('opacity', 0.0);
    $("#button_area").css('opacity', 0.0);

    document.getElementById("default_images_and_add").removeAttribute('hidden');
    put_image_pool()
}
function imageToDataUri(img, width, height) {

    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    // set its dimension to target size
    canvas.width = width;
    canvas.height = height;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);

    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL("image/jpeg");
}
function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                            var slice = byteCharacters.slice(offset, offset + sliceSize);

                            var byteNumbers = new Array(slice.length);
                            for (var i = 0; i < slice.length; i++) {
                                                byteNumbers[i] = slice.charCodeAt(i);
                                            }

                            var byteArray = new Uint8Array(byteNumbers);

                            byteArrays.push(byteArray);
                        }

          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
}

function submit(){

    // order files
    var childs = document.getElementById("input_images").childNodes;
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
			var ImageURL = child.src;
			// Split the base64 string in data and contentType
			var block = ImageURL.split(";");
			// Get the content type of the image
			var contentType = block[0].split(":")[1];// In this case "image/gif"
			// get the real base64 content of the file
			var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

			// Convert it to a blob to upload
			var blob = b64toBlob(realData, contentType);
			arr.push(blob);

        }
    }
    //console.log(arr)
    
    socket.emit("img", arr);
    
    $("#waiting_img").css("display", "block");
    $("#input_images").css('opacity', 0.25);
    $("#button_area").css('opacity', 0.25);
    
    
}
files = {}
var choose = document.getElementById('input_file');
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
                var size = (document.getElementById("default_images").clientWidth) / 3.5;
                if (size > 178) {
                    size = 178;
                }
                console.log('size', size);
                console.log(file);
                FileAPI.Image(file).resize(256, 256, 'max').get(function (err, canvas){
                    
                    console.log('err', err);
                        
                    var imgsrc = canvas.toDataURL("image/jpeg");
                    var img = document.createElement("img");
                    img.src = imgsrc;
                    img.width = size;
                    img.height = size;
                    index = Object.keys(files).length;
                    img.id = String(index);
                    files[String(index)] = file;
                    
                    var default_images = document.getElementById("default_images");
                    img.className += 'un_select_image';
                    img.onclick = function(e){
                        if (this.classList.contains('un_select_image')){
                            this.classList.remove('un_select_image');
                            this.classList.add('selected_image');
                        }else if(this.classList.contains('selected_image')){
                            this.classList.remove('selected_image');
                            this.classList.add('un_select_image');
                        }
                    }
                    default_images.prepend(img);
                });
            });
            document.getElementById("input_file").value = "";
            
        }
    );
});

function add_from_device(){
    var input_file = document.getElementById("input_file");
    input_file.click();
}
function use_these_images(){
    var images = document.getElementById("default_images").childNodes;
    var selected_images = [];
    for (let i=0; i<images.length; i++) {
        if (images[i].classList.contains('selected_image')){
            selected_images.push(images[i]);
        }
    }
    if (selected_images.length != 5){
        alert('Can only use 5 images');
        return;
    }
    else {
        var input_images = document.getElementById("input_images");
        var width = input_images.clientWidth*0.8;
        for (let i=0; i<selected_images.length; i++){
            var image = selected_images[i];
            image.classList.remove('selected_image');
            image.classList.add('used_image');
            image.width = width;
            image.height = width;
            input_images.appendChild(image);
        }
    }
    document.getElementById("default_images_and_add").hidden = true;
    $("#input_images").css('opacity', 1);
    $("#button_area").css('opacity', 1);
}



function put_image_pool(){
    var default_image = document.getElementById("default_images");
    for (var i=0; i<=27; i++){
        var dimg = document.createElement("img");
        dimg.className += 'un_select_image';
        dimg.setAttribute('src', 'default_images/'+i.toString()+'.jpg');
        dimg.setAttribute('id', 'default_images/'+i.toString()+'.jpg');
        var size = (document.getElementById("default_images").clientWidth) / 3.5;
        if (size > 178) {
            size = 178;
        }
        dimg.setAttribute('height', size.toString());
        dimg.setAttribute('width', size.toString());
        default_image.append(dimg);
        dimg.onclick = function(e){
            if (this.classList.contains('un_select_image')){
                this.classList.remove('un_select_image');
                this.classList.add('selected_image');
            }else if(this.classList.contains('selected_image')){
                this.classList.remove('selected_image');
                this.classList.add('un_select_image');
            }
        }
        
    }
}

// below is frame part

socket.on('frames', function (frameObjLists){
    $("#waiting_img").css("display", "none");
    $("#input_images").css("display", "none");
    $("#button_area").css('display', "none");
    $("#images_and_frames_and_buttons").css('display', "initial");

    // frameLists is list of list of frame
    console.log('receive frameLists:', frameObjLists);

    // put image and corresponding frames
    var images = document.getElementById("input_images").childNodes;
    images = Array.prototype.slice.call(images);
    
    var images_and_frames = document.getElementById("images_and_frames");
    for (let i=0; i<frameObjLists.length; i++){
        //console.log('before', images);
        put_image_and_frame(images_and_frames, images[i], frameObjLists[i]);
        //console.log('after', images);
    }
    
});

function color_frame(div) {
    tokens = div.innerHTML.split("_");
    var new_string = [];
    for (var index=0; index<tokens.length-1; index++){
        new_string.push(tokens[index]);
    }
    new_string = new_string.join("_");
    div.innerHTML = new_string;
    if (tokens[tokens.length-1] == "NOUN") {
        div.className += " noun_type";
    } 
    else {
        div.className += " frame_type";
    }
    if (new_string.length > 10){
        div.className += " small_font_terms";
    }
    
    return div;
}

function add_term(add_image, minus_image, image_and_terms_div){
    //console.log('this1', add_image);
    if (add_image.adding_flag == true){
        return
    }
    if (minus_image.minus_flag == true){
        return
    }
    add_image.adding_flag = true;
    //console.log(add_image);
    var single_frame = document.createElement("div");
    single_frame.onclick = single_frame.contentEditable='true';
    single_frame.className += "single_frame";
    // black-tech!!!!
    setTimeout(function() {
        single_frame.focus();
    }, 0);
    
    single_frame.addEventListener('keypress', function(evt) {
        if (evt.which === 13) {
            evt.preventDefault();
        }
    });

    single_frame.addEventListener("blur", function(evt){
        console.log(single_frame);
        if (single_frame.innerHTML == ""){
            image_and_terms_div.removeChild(single_frame);
            add_image.adding_flag = false;
        };
    });

    single_frame.addEventListener('DOMSubtreeModified',function(e){
        var query = single_frame.innerHTML;
        if (query.length == 0) {
            console.log('return');
            var to_delete_elements = image_and_terms_div.getElementsByClassName("suggestion");
            while (to_delete_elements[0]) {
                to_delete_elements[0].parentNode.removeChild(to_delete_elements[0]);
            }
            return;
        }
        
        socket.emit("search", String(query), function(results){
            //console.log('now in search', single_frame.innerHTML);
            //console.log('query', query);
            if (single_frame.innerHTML != query) {
                return;
            }
            console.log('result is', results);
            var to_delete_elements = image_and_terms_div.getElementsByClassName("suggestion");
            while (to_delete_elements[0]) {
                to_delete_elements[0].parentNode.removeChild(to_delete_elements[0]);
            }
            
            // show frame suggestion
            for (let i=0; i<results.length; i++){
                var suggestion = document.createElement("div");
                suggestion.className += 'suggestion';
                suggestion.innerHTML = results[i].name;
                suggestion.addEventListener("click", function(e){
                    this.className += " selected";
                    //console.log('in suggestion.click()');
                    single_frame.innerHTML = "";
                    var new_single_frame = document.createElement("div");
                    new_single_frame.className += " single_frame";
                    new_single_frame.innerHTML = this.innerHTML;
                    new_single_frame = color_frame(new_single_frame);
                    //console.log(new_single_frame);
                    image_and_terms_div.insertBefore(new_single_frame, image_and_terms_div.childNodes[2]);
                    //finish adding frame
                    var to_delete_elements = image_and_terms_div.getElementsByClassName("suggestion");
                    while (to_delete_elements[0]) {
                        to_delete_elements[0].parentNode.removeChild(to_delete_elements[0]);
                    }
                    image_and_terms_div.removeChild(single_frame);
                    add_image.adding_flag = false;
                });
                image_and_terms_div.insertBefore(suggestion, image_and_terms_div.childNodes[3+i]);
                
            }
        });   
    });

    image_and_terms_div.insertBefore(single_frame, image_and_terms_div.childNodes[2]);  
}
function remove_term(add_img, minus_img, image_and_terms_div){
    if (add_img.adding_flag == true){
        return
    }
    if (minus_img.minus_flag == true){
        for (let i=0; i<image_and_terms_div.childNodes.length; i++) {
            var div = image_and_terms_div.childNodes[i];
            console.log(div);
            var button = div.querySelector("button");
            if (button == null) {
                // the image, plus and minus image area and searching single frame 
                // have no button;
                continue;
            }
            console.log(button);
            div.removeChild(button);   
        }
        minus_img.minus_flag = false;
    }
    else{
        minus_img.minus_flag = true;
        for (let i=0; i<image_and_terms_div.childNodes.length; i++) {
            var div = image_and_terms_div.childNodes[i];
            if (div.classList.contains("single_frame")){
                var removeButton = document.createElement("button");
                removeButton.innerHTML = "X";
                removeButton.className += " remove_button"
                removeButton.addEventListener("click", function(e){
                    this.parentNode.parentNode.removeChild(this.parentNode);
                });
                div.appendChild(removeButton);
            }
        }
    }
}

function put_image_and_frame(result_DOM, image, frameList){
    var div = document.createElement("div");
    div.className += 'image_and_frame';
    //console.log(image);
    div.appendChild(image);
    var button_div = document.createElement("div");
    button_div.className += "button_div";
    var add_img = document.createElement("img");
    add_img.src = "img/iconfinder_add_126583.png/";
    add_img.adding_flag = false;
    var minus_img = document.createElement("img");
    minus_img.src = "img/iconfinder_icon-minus-round_211863.png";
    minus_img.minus_flag = false;
    add_img.addEventListener("click", function(e){add_term(add_img, minus_img, div)});
    button_div.appendChild(add_img);
    minus_img.addEventListener("click", function(e){remove_term(add_img, minus_img, div)});
    button_div.appendChild(minus_img);
    div.appendChild(button_div);

    for (let i=0; i<frameList.length; i++){
        var single_frame = document.createElement("div");
        single_frame.classList.add("single_frame");
        single_frame.innerHTML = frameList[i].name;
        single_frame = color_frame(single_frame);
        div.appendChild(single_frame);
    }
    result_DOM.appendChild(div);
}

// below is story part
function generate_story(){
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    console.log(images_and_frames);
    var framesList = [];
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        frames = image_and_frames.getElementsByClassName('single_frame');
        var arr = [];
        for (let j=0; j<frames.length; j++){
            frame = frames[j]
            frame_string = frame.innerHTML.split('<div>')[0];
            
            if (frame.classList.contains("noun_type")) {
                frame_string += "_NOUN";
            }
            else if (frame.classList.contains("frame_type")) {
                frame_string += "_Frame";
            }
            
           arr.push(frame_string);
        }
        framesList.push(arr);
    }
    socket.emit("frames", framesList);
    $("#waiting_img").css("display", "block");
    $("#images_and_frames_and_buttons").css('opacity', 0.25);
}

socket.on('story', function (storys){
    $("#images_and_frames_and_buttons").css('display', "none");
    $("#waiting_img").css("display", "none");
    $("#gallery").css('display', "initial");
    $("body").css('display', 'initial');
    console.log('receive storys:', storys);
    
    var mySwiper = new Swiper ('.swiper-container', {
        // Optional parameters
        initialSlide: 2,
    
        // If we need pagination
        pagination: {
        el: '.swiper-pagination',
        },
    });
    const height = put_images();
    put_storys(height, storys);
    put_terms(height);       
});

function put_images(){
    var DOM = document.getElementById("show_images");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    const width = DOM.clientHeight*0.18;
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    var DOM = document.getElementById("show_images2");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        var image = image_and_frames.getElementsByTagName('img')[0];
        console.log(image);
        image = image.cloneNode(true);
        image.width = width;
        image.height = width;
        image.classList.add('showing');
        DOM.appendChild(image);
    }
    return width;
}

function put_terms(height){
    var DOM = document.getElementById("show_terms");
    
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    console.log(images_and_frames);
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        const image_and_frames = images_and_frames[i];
        single_terms = image_and_frames.getElementsByClassName('single_frame');
        //console.log('single_terms', single_terms);
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing_terms');
        for (let j=0; j<single_terms.length; j++){
            single_term = single_terms[j];
            single_term = single_term.cloneNode(true);
            div.appendChild(single_term);
        }
        DOM.appendChild(div);
    }
}

function put_storys(height, storys){
    var DOM = document.getElementById("show_storys");
    var images_and_frames = document.getElementById("images_and_frames").childNodes;
    images_and_frames = Array.prototype.slice.call(images_and_frames);
    for (let i=0; i<images_and_frames.length; i++){
        // image_and_frames is a div with a image and its corresponding frames
        var div = document.createElement("div");
        //div.style.width = height;
        div.style.height = height;
        div.classList.add('showing');
        div.innerHTML = storys[i];
        DOM.appendChild(div);
    }
    
}
