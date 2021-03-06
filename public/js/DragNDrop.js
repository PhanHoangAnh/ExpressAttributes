var newId = 0;

// Sortable function
$(function () {
    var creatAttributePad = document.querySelector('creatAttributePad');
    // var sortableDiv = document.querySelector("#div2");
    var sortableDiv = creatAttributePad.querySelector('[component-role = "receivedPad"]');
    // console.log(document.querySelector("#div2") == creatAttributePad.querySelector('[component-role = "receivedPad"]'));
    $(sortableDiv).sortable({
        // connectWith: ".connectedSortable",
        sort: function (e) {
            // console.log('X:' + e.screenX, 'Y:' + e.screenY);
            $('[data-toggle=popover]').each(function () {
                // hide any open popovers when the anywhere else in the body is clicked                
                $(this).popover('hide');
            });

        },
        placeholder: "ui-sortable-placeholder",
        receive: function (e, ui) {
            ui.sender.sortable("cancel");
        },
        over: function (e, ui) {
            sortableIn = 1;
        },
        out: function (e, ui) {
            sortableIn = 0;
        },
        beforeStop: function (e, ui) {
            if (sortableIn == 0) {
                //ui.item.remove();
                $(ui.item.context).popover('destroy');
                $('[data-toggle=popover]').each(function () {
                    // hide any open popovers when the anywhere else in the body is clicked                        
                    $(this).popover('hide');
                });
                ui.item.remove();
            }
        }
    });

    $(".connectedSortable").sortable({
        connectWith: $(sortableDiv),
        remove: function (e, ui) {
            // 
            var nodeCopy = ui.item.clone();
            newId++;
            nodeCopy[0].id = newId; /* We cannot use the same ID */
            nodeCopy.attr("data-toggle", "popover");
            nodeCopy.attr("data-placement", "right");
            // chipl initiated popover before first click
            // 1. Create template for associated popover
            // Exception for combobox
            if (nodeCopy[0].getElementsByTagName("datalist").length != 0) {
                console.log(nodeCopy[0].getElementsByTagName("datalist").length);
                nodeCopy[0].getElementsByTagName("datalist")[0].id = newId + "list";
                var input = nodeCopy[0].getElementsByTagName("input")[0];
                input.setAttribute("list", newId + "list");
            }
            //
            nodeCopy.controlType = nodeCopy.attr("data-controlType");
            nodeCopy.attribute = {};
            for (var i in g_controlDatas) {
                if (g_controlDatas[i]["Input Type"] == nodeCopy.controlType) {
                    for (var att in g_controlDatas[i]["fields"]) {
                        nodeCopy.attribute[att] = g_controlDatas[i]["fields"][att];
                    }
                }
            }
            nodeCopy.setted = false;
            var popoverContent = createAttributePanel(nodeCopy);
            // 2. Create popover
            $(nodeCopy).popover({
                html: true,
                trigger: 'click',
                title: nodeCopy.controlType,
                content: function () {
                    $('[data-toggle=popover]').each(function () {
                        // hide any open popovers when the anywhere else in the body is clicked                            
                        if (this != nodeCopy.get(0)) {
                            $(this).popover('hide');
                        }
                    });
                    return popoverContent;
                }
            });
            //nodeCopy.preventDefault;
            nodeCopy.appendTo(sortableDiv);
            $(this).sortable('cancel');
        },
        receive: function (e, ui) {
            ui.sender.sortable("cancel");
        },
        placeholder: "ui-sortable-placeholder",
        out: function (event, ui) {
            $('.placeholder').show();
        }
    });
})
// Create controls from JSON definition
$(function CreateControlsTemplate() {
    // body...
    for (i in g_controlDatas) {
        createSingleControlGroup(g_controlDatas[i]);
    }
    setAttributeName();
})

function createSingleControlGroup(template) {
    newId++;
    // --------------------------//
    var creatAttributePad = document.querySelector('creatAttributePad');
    // var sortableDiv = document.querySelector("#div2");
    var receivedPad = creatAttributePad.querySelector('[component-role = "receivedPad"]');
    var container_div = creatAttributePad.querySelector('[component-role="containerControl"]').content;

    var majorDiv = container_div.querySelector('[component-role="container_div"]');
    majorDiv.id = newId
    receivedPad.appendChild(document.importNode(container_div, true));
    container_div = document.getElementById(newId);
    container_div.querySelector('[data-controltype="label"]').innerHTML = template["label"];
    var input_cover = container_div.querySelector('[component-role = "inpuCover"]');
    var input = document.createElement("input");
    input.classList.add("col-md-12","col-lg-12","form-control");
    
    switch (template["Input Type"]) {
        case ("text"):
            input.type = "text";
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
            }
            input.setAttribute("data-controlType", "text");
            input_cover.appendChild(input);
            container_div.setAttribute("data-controlType", "text");
            break;
        case ("combobox"):
            input.type = "combobox";
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
            }
            input.setAttribute("data-controlType", "combobox");
            input_cover.appendChild(input);
            container_div.setAttribute("data-controlType", "combobox");
            // in case for editable combobox, create datalist for this input
            if (template["fields"]["options"]) {
                var datalistId = newId + "datalist";
                input.setAttribute("list", datalistId);
                var datalist = document.createElement("datalist")
                datalist.id = datalistId;
                for (item in template["fields"]["options"]) {
                    var option = document.createElement("option");
                    option.setAttribute("value", template["fields"]["options"][item]);
                    datalist.appendChild(option);
                }
                input_cover.appendChild(datalist);
            }
            break;
        case ("select"):
            input = document.createElement("select");
            input.classList.add("col-md-12","col-lg-12","form-control");
            if (template["fields"]["options"]) {
                for (item in template["fields"]["options"]) {
                    var option = document.createElement("option");
                    option.setAttribute("value", item);
                    option.innerHTML = template["fields"]["options"][item];
                    input.appendChild(option);
                }
            }
            input_cover.appendChild(input);
            input.setAttribute("data-controlType", "select");
            container_div.setAttribute("data-controlType", "select");
            break;
        case ("textarea"):
            input = document.createElement("textarea");
            input.type = "textarea";
            input.setAttribute("data-controlType", "textarea");
            input_cover.appendChild(input);
            container_div.setAttribute("data-controlType", "textarea");
            break;
        case ("radio"):
            input = document.createElement("input");
            input.type = "radio";
            input.name = template["value"];
            if (template["fields"]["options"]) {
                for (item in template["fields"]["options"]) {
                    input.classList.add("col-md-6");
                    input.classList.add("col-lg-6");
                    input.value = item;
                    var copy_radio = input.cloneNode(true);
                    input_cover.appendChild(copy_radio);
                    var span = document.createElement("span")
                    span.innerHTML = template["fields"]["options"][item];
                    span.classList.add("col-md-6");
                    span.classList.add("col-lg-6");
                    input_cover.appendChild(span);
                }
                input_cover.setAttribute("data-controlType", "options");
            }
            container_div.setAttribute("data-controlType", "radio");
            break;
        case ("checkbox"):
            input = document.createElement("input");
            input.type = "checkbox";
            input.name = template["value"];
            if (template["fields"]["options"]) {
                for (item in template["fields"]["options"]) {
                    input.classList.add("col-md-6");
                    input.classList.add("col-lg-6");
                    input.value = item;
                    var copy_radio = input.cloneNode(true);
                    input_cover.appendChild(copy_radio);
                    var span = document.createElement("span")
                    span.innerHTML = template["fields"]["options"][item];
                    span.classList.add("col-md-6");
                    span.classList.add("col-lg-6");
                    input_cover.appendChild(span);
                }
                input_cover.setAttribute("data-controlType", "options");
                container_div.setAttribute("data-controlType", "checkbox");
            }
            break;
        case ("number"):
            input.setAttribute("data-controlType", "number");
            input.type = "number";
            if (template["fields"]["min"]) {
                input.min = template["fields"]["min"];
            }
            if (template["fields"]["max"]) {
                input.max = template["fields"]["max"];
            }
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
            }
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "number");
            break;
        case ("date"):
            input.type = "date";
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
                input.setAttribute("data-controlType", "input");
            }
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "date");
            break;
        case ("color"):
            input.type = "color";
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
                input.setAttribute("data-controlType", "input");
            }
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "color");
            break;
        case ("range"):
            input.type = "range";
            if (template["fields"]["min"]) {
                input.min = template["fields"]["min"];
            }
            if (template["fields"]["max"]) {
                input.max = template["fields"]["max"];
            }
            if (template["placeholder"]) {
                input.placeholder = template["placeholder"];
            }
            container_div.setAttribute("data-controlType", "range");
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            break;
        case ("month"):
            input.type = "month";
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "month");
            break;
        case ("week"):
            input.type = "week";
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "week");
            break;
        case ("time"):
            input.type = "time";
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "time");
            break;
        case ("image"):
            input = document.createElement("img");
            // input.setAttribute("src","./materials/sample.jpg");
            // https://rawgit.com/PhanHoangAnh/CreateDynamicAttributeSets/master/materials/sample.jpg
            input.setAttribute("src", "https://rawgit.com/PhanHoangAnh/CreateDynamicAttributeSets/master/materials/sample.jpg");
            input.style.height = "auto";
            input.classList.add("col-md-12","col-lg-12","form-control");
            input_cover.insertBefore(input, container_div.querySelector('[data-controltype="describe"]'));
            container_div.setAttribute("data-controlType", "image");
            break;

    }

    if (template["fields"]["describe"]) {
        var span = container_div.querySelector('[data-controltype="describe"]')
        span.innerHTML = template["fields"]["describe"]["value"];
    }
    input_cover.appendChild(span);
    container_div.appendChild(input_cover);
    //Test
    var container = template["container"];
    document.getElementById(container).appendChild(container_div);
}

function createAttributePanel(nodeCopy, title) {

    var controlType = nodeCopy.controlType;
    var fileds = nodeCopy.attribute;
    var main_panel = document.createElement('main_panel');
    main_panel.classList.add("col-md-12");
    main_panel.classList.add("col-lg-12");
    main_panel.classList.add("clearfix");
    for (var item in fileds) {
        var label = document.createElement("LABEL");
        label.classList.add("col-lg-12");
        label.classList.add("col-md-12");
        main_panel.appendChild(label);
        if (item != "options" && item != "min" && item != "max") {
            label.innerHTML = fileds[item]["label"];
            var input = document.createElement("input");
            input.classList.add("col-md-12");
            input.classList.add("col-lg-12");
            input.type = fileds[item]["Input Type"];
            input.placeholder = fileds[item]["value"];

            input.setAttribute("data-controlType", item);
            input.addEventListener("change", changeControlAttribute, false);

            if (item == "required") {
                var row = document.createElement("div");
                // row.classList.add("row");
                row.classList.add("clearfix");
                row.style.float = "left";
                row.style.width = "100%";
                row.style["padding-top"] = "7px";
                label.classList.remove("col-lg-12");
                label.classList.remove("col-md-12");
                label.classList.add("col-lg-6");
                label.classList.add("col-md-6");
                label.innerHTML = "Require";
                input.classList.remove("col-lg-12");
                input.classList.remove("col-md-12");
                input.classList.add("col-md-6");
                input.classList.add("col-lg-6");
                input.type = fileds[item]["Input Type"];
                input.addEventListener("change", changeControlAttribute, false);
                row.appendChild(label);
                row.appendChild(input);
                main_panel.appendChild(row);
            } else {
                main_panel.appendChild(input);
            }
        }
        if (item == "options") {
            // if (nodeCopy.controlType == "radio"){};
            var input = document.createElement('textarea');
            input.rows = 3;
            input.classList.add("col-md-12");
            input.classList.add("col-lg-12");
            label.innerHTML = "Options";
            var opt_string = "";
            for (var opt in fileds["options"]) {
                opt_string = opt_string + fileds["options"][opt] + "\n";
            }
            input.value = opt_string;
            input.setAttribute("data-controlType", item)
            input.addEventListener("change", changeControlAttribute, false);
            main_panel.appendChild(input);
        }
        if (item == "min" || item == "max") {
            label.innerHTML = item;
            var input = document.createElement("input");
            input.classList.add("col-md-12");
            input.classList.add("col-lg-12");
            input.type = "number";
            input.placeholder = "Number only";
            input.setAttribute("data-controlType", item);
            input.addEventListener("change", changeControlAttribute, false);
            main_panel.appendChild(input);
        }

    }
    var hr = document.createElement("hr");
    hr.setAttribute("style", "width: 100%;display: block;float: left;");
    main_panel.appendChild(hr);
    var closeBnt = document.createElement("button");
    closeBnt.classList.add("btn");
    closeBnt.classList.add("btn-primary");
    closeBnt.innerHTML = "Close";
    closeBnt.addEventListener("click", function (evt) {
        $('[data-toggle=popover]').each(function () {
            $(this).popover('hide');
        });
        saveElement();
    }, false);

    var controlHandler = document.createElement("div");
    controlHandler.style["text-align"] = "center";
    controlHandler.style["padding-bottom"] = "15px"
    controlHandler.appendChild(closeBnt);

    var cover = document.createElement("cover");
    cover.classList.add("row");
    cover.style.float = "left";
    cover.style.padding = "15px";
    main_panel.appendChild(controlHandler);
    cover.appendChild(main_panel);

    function changeControlAttribute(evt) {
        var ctrType = this.getAttribute("data-controlType");
        var controls;
        var htmlNodeCopy;
        if (nodeCopy instanceof Node) {
            controls = $(nodeCopy).get(0).querySelectorAll("[data-controlType]");
            htmlNodeCopy = nodeCopy;
        } else {
            controls = nodeCopy.get(0).querySelectorAll("[data-controlType]");
            htmlNodeCopy = nodeCopy.get(0);
        }
        if (!htmlNodeCopy["CUST"]) {
            htmlNodeCopy["CUST"] = {};
        }
        for (var elem in controls) {
            htmlNodeCopy["CUST"][ctrType] = this.value;
            if (controls[elem] instanceof Node && ctrType == "placeholder" && (controls[elem].type == "text" || controls[elem].type == "number")) {
                controls[elem].placeholder = this.value;
            }
            if (controls[elem] instanceof Node && ctrType == "options" && (controls[elem].type == "select-one")) {
                var select = controls[elem];
                var optArr = $(this).val().split('\n');
                optArr = optArr.filter(function (n) {
                    return n != "";
                });
                while (select.firstChild) {
                    select.removeChild(select.firstChild);
                }
                for (var item in optArr) {
                    var option = document.createElement("option");
                    option.setAttribute("value", item);
                    option.innerHTML = optArr[item];
                    select.appendChild(option);
                }
            }

            if (controls[elem] instanceof Node && ctrType == "options" && (controls[elem].type == "text")) {
                var optArr = $(this).val().split('\n');
                optArr = optArr.filter(function (n) {
                    return n != "";
                });
                // Select and update datalist                
                var datalistId = controls[elem].getAttribute("list");
                var datalist = document.getElementById(datalistId);
                while (datalist.firstChild) {
                    datalist.removeChild(datalist.firstChild);
                }

                for (var item in optArr) {
                    var option = document.createElement("option");
                    option.setAttribute("value", optArr[item])
                    datalist.appendChild(option);
                }
            }
            if (controls[elem] instanceof Node && controls[elem].getAttribute("data-controltype") == ctrType) {
                if (ctrType == "options") {
                    // follow http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
                    var optArr = $(this).val().split('\n');
                    optArr = optArr.filter(function (n) {
                        return n != "";
                    });
                    //console.log(optArr);
                    var describe = controls[elem].querySelector("[data-controlType='describe']").cloneNode(true);
                    while (controls[elem].firstChild) {
                        controls[elem].removeChild(controls[elem].firstChild);
                    }
                    var inputType = controls[elem].parentNode.getAttribute("data-controlType");
                    var input = document.createElement("input");
                    input.type = inputType;
                    for (var item in optArr) {
                        // Set input name later
                        input.classList.add("col-md-6");
                        input.classList.add("col-lg-6");
                        input.value = item;
                        var copy_radio = input.cloneNode(true);
                        controls[elem].appendChild(copy_radio);
                        var span = document.createElement("span")
                        span.innerHTML = optArr[item];
                        span.classList.add("col-md-6");
                        span.classList.add("col-lg-6");
                        controls[elem].appendChild(span);
                    }
                    controls[elem].appendChild(describe);
                } else {
                    controls[elem].innerHTML = this.value;
                    if (title) {
                        compObj.AttributeSetsName = this.value;
                    }
                }
            }
        }
    }
    return cover;
}

function setAttributeName() {
    var legent = document.querySelector("#SetsName");
    // var legent = $(_legent);
    legent.setAttribute("data-toggle", "popover");
    legent.setAttribute("data-placement", "right");
    legent.attribute = {};
    legent.attribute["label"] = {
        "label": "Set Attributes Set Name",
        "Input Type": "text",
        "value": "Text Input"
    }

    legent.setted = false;
    var _Content = createAttributePanel(legent, true);
    // 2. Create popover
    $(legent).popover({
        html: true,
        // trigger: 'click',
        title: "Set Attributes Name",
        content: function () {
            $('[data-toggle=popover]').each(function () {
                if (this != legent) {
                    $(this).popover('hide');
                }
            });
            return _Content;
        }
    });
}

var compObj = {}

function saveElement() {
    // update entire sortable
    var creatAttributePad = document.querySelector('creatAttributePad');
    var sortableDiv = creatAttributePad.querySelector('[component-role = "receivedPad"]');
    var elementLists = sortableDiv.querySelectorAll("[id]");
    var printedList = [];
    for (var elem in elementLists) {
        if (elementLists[elem]["CUST"]) {
            var jsonObj = {}
            jsonObj["data-controlType"] = elementLists[elem].getAttribute("data-controlType");
            jsonObj["attributes"] = elementLists[elem]["CUST"];
            printedList.push(jsonObj);
        }
    }
    compObj.components = printedList
    document.getElementById("printJSON").innerHTML = JSON.stringify(compObj, undefined, 2);
}