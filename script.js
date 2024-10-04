$(document).ready(function () {
  const LOCAL_STORAGE_KEY = "visualFormDesignerData";
  const sampleFormData = [
    {
      id: "c0ac49c5-871e-4c72-a878-251de465e6e5",
      type: "input",
      label: "Sample Input",
      placeholder: "Sample placeholder",
    },
    {
      id: "146e69c2-1630-4a27-9d0b-f09e463a66e4",
      type: "select",
      label: "Sample Select",
      options: ["Sample Option 1", "Sample Option 2", "Sample Option 3"],
    },
    {
      id: "45002ecf-85cf-4852-bc46-529f94a758f5",
      type: "input",
      label: "Another Input",
      placeholder: "Another placeholder",
    },
    {
      id: "680cff8d-c7f9-40be-8767-e3d6ba420952",
      type: "textarea",
      label: "Sample Textarea",
      placeholder: "Sample textarea placeholder",
    },
  ];
  let formData = loadFormData();
  function loadFormData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing form data from local storage:", e);
        return sampleFormData;
      }
    } else {
      return sampleFormData;
    }
  }

  function saveFormData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }
  function renderForm() {
    $("#form-builder").empty();
    formData.forEach((element) => {
      let formElement = createFormElement(element);
      $("#form-builder").append(formElement);
    });
    // Make the form sortable
    $("#form-builder").sortable({
      placeholder: "ui-sortable-placeholder",
      update: function (event, ui) {
        // Update formData order based on DOM
        let updatedFormData = [];
        $("#form-builder .form-element").each(function () {
          let id = $(this).data("id");
          let element = formData.find((el) => el.id === id);
          if (element) {
            updatedFormData.push(element);
          }
        });
        formData = updatedFormData;
        saveFormData();
      },
    });
    $("#form-builder").disableSelection();
  }

  // Function to create a form element HTML
  function createFormElement(element) {
    let $elementDiv = $("<div>", {
      class: "form-element",
      "data-id": element.id,
    });
    let $label = $("<div>", { class: "element-label", text: element.label });
    let $field;

    switch (element.type) {
      case "input":
        $field = $("<input>", {
          type: "text",
          placeholder: element.placeholder,
          disabled: true,
        });
        break;
      case "select":
        $field = $("<select>", { disabled: true });
        element.options.forEach((option) => {
          $field.append($("<option>", { text: option }));
        });
        break;
      case "textarea":
        $field = $("<textarea>", {
          placeholder: element.placeholder,
          disabled: true,
        });
        break;
      default:
        $field = $("<input>", { type: "text", disabled: true });
    }

    let $controls = $("<div>", { class: "element-controls" });
    let $editBtn = $("<button>", {
      text: "Edit",
      class: "edit-element",
      type: "button",
    });
    let $deleteBtn = $("<button>", {
      text: "Delete",
      class: "delete-element",
      type: "button",
    });

    $controls.append($editBtn, $deleteBtn);
    $elementDiv.append($label, $field, $controls);

    return $elementDiv;
  }

  // Initial rendering of the form
  renderForm();

  // Function to generate a unique ID
  function generateId() {
    return "id-" + Math.random().toString(36).substr(2, 16);
  }

  // Add Input
  $("#add-input").click(function () {
    let newElement = {
      id: generateId(),
      type: "input",
      label: "New Input",
      placeholder: "Enter text",
    };
    formData.push(newElement);
    saveFormData();
    renderForm();
  });

  // Add Select
  $("#add-select").click(function () {
    let newElement = {
      id: generateId(),
      type: "select",
      label: "New Select",
      options: ["Option 1", "Option 2"],
    };
    formData.push(newElement);
    saveFormData();
    renderForm();
  });

  // Add Textarea
  $("#add-textarea").click(function () {
    let newElement = {
      id: generateId(),
      type: "textarea",
      label: "New Textarea",
      placeholder: "Enter text",
    };
    formData.push(newElement);
    saveFormData();
    renderForm();
  });

  // Delete Element
  $("#form-builder").on("click", ".delete-element", function () {
    let elementId = $(this).closest(".form-element").data("id");
    formData = formData.filter((el) => el.id !== elementId);
    saveFormData();
    renderForm();
  });

  // Edit Element
  $("#form-builder").on("click", ".edit-element", function () {
    let elementId = $(this).closest(".form-element").data("id");
    let element = formData.find((el) => el.id === elementId);
    if (element) {
      $("#edit-element-id").val(element.id);
      $("#edit-label").val(element.label);
      $("#edit-placeholder").val(element.placeholder || "");

      if (element.type === "select") {
        $("#select-options-group").show();
        $("#edit-placeholder-group").hide();
        $("#select-options-list").empty();
        element.options.forEach((option) => {
          addOptionToList(option);
        });
      } else {
        $("#select-options-group").hide();
        $("#edit-placeholder-group").show();
      }

      $("#edit-modal").dialog({
        modal: true,
        width: 400,
        buttons: {
          Save: function () {
            let updatedLabel = $("#edit-label").val();
            let updatedPlaceholder = $("#edit-placeholder").val();
            let updatedId = $("#edit-element-id").val();

            let formElement = formData.find((el) => el.id === updatedId);
            if (formElement) {
              formElement.label = updatedLabel;
              if (formElement.type !== "select") {
                formElement.placeholder = updatedPlaceholder;
              } else {
                // Update options
                let updatedOptions = [];
                $("#select-options-list li input").each(function () {
                  let optionText = $(this).val();
                  if (optionText.trim() !== "") {
                    updatedOptions.push(optionText.trim());
                  }
                });
                formElement.options = updatedOptions;
              }
            }
            saveFormData();
            renderForm();
            $(this).dialog("close");
          },
          Cancel: function () {
            $(this).dialog("close");
          },
        },
      });
    }
  });

  // Add Option in Select
  $("#add-option").click(function () {
    addOptionToList("");
  });

  // Function to add an option input field
  function addOptionToList(value) {
    let $li = $("<li>");
    let $input = $("<input>", {
      type: "text",
      value: value,
      placeholder: "Option text",
    });
    let $deleteBtn = $("<button>", {
      text: "Delete",
      type: "button",
      class: "delete-option",
    });
    $li.append($input, $deleteBtn);
    $("#select-options-list").append($li);
  }

  // Delete Option in Select
  $("#select-options-list").on("click", ".delete-option", function () {
    $(this).closest("li").remove();
  });

  // Save Form
  $("#save-form").click(function () {
    // To get the current order, iterate through the DOM
    let updatedFormData = [];
    $("#form-builder .form-element").each(function () {
      let id = $(this).data("id");
      let element = formData.find((el) => el.id === id);
      if (element) {
        updatedFormData.push(element);
      }
    });
    console.log("Saved Form JSON:", JSON.stringify(updatedFormData, null, 2));
    alert("Form JSON has been logged to the console.");
  });
});
