
import db from "../assets/js/firebase.js";
import { MAP_RECTANGLE_FLOORS, updatePosition } from "../assets/js/helpers.js";
import { showAnchorDetails } from "./anchor.js";
import { showProductDetails } from "./product.js";

const floors = document.getElementById("floors");
const maps = document.getElementsByClassName("map");
const rectangles = document.getElementsByClassName("rectangle");
const floorInfoContainers = document.getElementsByClassName(
  "floor-info-container"
);

function displayFloorInformation(
  name,
  address,
  productCount,
  anchorCount,
  floorName
) {
  const floorInfoContainer = document.getElementById(
    `floorInfoContainer${floorName}`
  );
  var infoHTML = `
              <div class="floor-info">
                  <h3>Floor Information</h3>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Address:</strong> ${address}</p>
                  <p><strong>Total Products:</strong> ${productCount}</p>
                  <p><strong>Total Anchors:</strong> ${anchorCount}</p>
              </div>
          `;
  floorInfoContainer.innerHTML = infoHTML;
}

//Truy cập đến map trong menutracuus
const floor = (building, rectangle, stage) => {
  const floorName = stage.charAt(stage.length - 1);
  // const thisFloor = stage;
  const stageButton = document.createElement("button");
  stageButton.style.marginRight = "1%";
  const rectangleElement = document.getElementById(rectangle);
  const currentButton = document.getElementById(stageButton.id);
  const floors = document.getElementById("floors");
  const floorInfoContainer = document.getElementById(
    `floorInfoContainer${floorName}`
  );
  if (!currentButton) floors.appendChild(stageButton);

  var showStage = true;

  stageButton.setAttribute("class", "stageButton");
  stageButton.id = "stageButton" + stage;


  stageButton.addEventListener("click", function () {
    if (showStage) {
      const anotherFloors = document.getElementsByClassName("rectangle");
      for (let element of anotherFloors) {
        if (element.id !== rectangleElement.id) {
          element.style.display = "none";
        }
      }
      for (let element of floorInfoContainers) {
        if (element.id !== floorInfoContainer) {
          element.style.display = "none";
        }
      }
      rectangleElement.style.display = "flex";
      floorInfoContainer.style.display = "block";
      document.querySelectorAll(".product").forEach(function (product) {
        product.style.display = "block";
      });
      document.querySelectorAll(".anchor").forEach(function (anchor) {
        anchor.style.display = "block";
      });
      showStage = false;
    } else {
      rectangleElement.style.display = "none";
      floorInfoContainer.style.display = "none";
      showStage = true;
    }
    // Truy cập dữ liệu tên và địa chỉ từ Firebase
    db.ref(`/${building}/${stage}/information`).once(
      "value",
      function (snapshot) {
        var name = snapshot.val().name || "N/A";
        var address = snapshot.val().address || "N/A";

        // Tính tổng số lượng sản phẩm từ Firebase
        db.ref(`/${building}/${stage}/product`).once(
          "value",
          function (productSnapshot) {
            var productCount = productSnapshot.numChildren();

            // Tính tổng số lượng anchor từ Firebase
            db.ref(`/${building}/${stage}/anchor`).once(
              "value",
              function (anchorSnapshot) {
                displayFloorInformation(
                  name,
                  address,
                  productCount,
                  anchorSnapshot.numChildren(),
                  floorName
                );
              }
            );
          }
        );
      }
    );
  });
  //Theo dõi trạng thái của Button floor 1
  //Hiển thị product trên Map
  document.querySelectorAll(".product").forEach(function (product, index) {
    product.style.display = "block";
    var productId = "product" + (index + 1);

    db.ref(`/${building}/${stage}/product`).once(
      "value",
      function (productSnapshot) {
        if (productSnapshot.child(productId).val())
          updatePosition(productSnapshot.child(productId), product.id);
      }
    );
  });

  document
    .querySelectorAll(`#${MAP_RECTANGLE_FLOORS[stage]} > .product`)
    .forEach(function (product, index) {
      // product.style.display = "block";
      product.addEventListener("click", function () {
        showProductDetails(building, stage, product.id);
      });
    });

  //Hiển thị anchor trên map
  document.querySelectorAll(".anchor").forEach(function (anchor, index) {
    anchor.style.display = "block";
    var anchorId = "anchor" + (index + 1);

    db.ref(`/${building}/${stage}/anchor`).once(
      "value",
      function (anchorSnapshot) {
        if (anchorSnapshot.child(anchorId).val())
          updatePosition(anchorSnapshot.child(anchorId), anchor.id);
      }
    );
  });
  document
    .querySelectorAll(`#${MAP_RECTANGLE_FLOORS[stage]} > .anchor`)
    .forEach(function (anchor, index) {
      // anchor.style.display = "block";
      anchor.addEventListener("click", function () {
        showAnchorDetails(building, stage, anchor.id);
      });
    });

  //Khi bắt đầu, các phần tử rectangle, product, anchor ẩn đi.
  // rectangleElement.style.display = "none";
  document.querySelectorAll(".product").forEach(function (product) {
    product.style.display = "none";
  });
  document.querySelectorAll(".anchor").forEach(function (anchor) {
    anchor.style.display = "none";
  });

  //Tải dữ liệu của Products và Anchors từ Firebase
  document.addEventListener("DOMContentLoaded", function () {
    // Duyệt qua dữ liệu trong 'product'
    db.ref(`/${building}/${stage}/product`).on(
      "value",
      function (productSnapshot) {
        productSnapshot.forEach(function (childSnapshot) {
          var productId = childSnapshot.key;
          var product = document.getElementById(productId);
          if (product && childSnapshot) {
            updatePosition(childSnapshot, productId);
          }
        });
      }
    );

    // Duyệt qua dữ liệu trong 'anchor'
    db.ref(`/${building}/${stage}/anchor`).on(
      "value",
      function (anchorSnapshot) {
        anchorSnapshot.forEach(function (childSnapshot) {
          var anchorId = childSnapshot.key;
          var anchor = document.getElementById(anchorId);
          if (anchor) {
            updatePosition(childSnapshot, anchorId);
          }
        });
      }
    );
  });


  function updateStageButtonContent(productCount, anchorCount) {
    stageButton.textContent = `Floor ${floorName} (${productCount}P/${anchorCount}A)`;
  }

  // Hàm tính tổng số lượng sản phẩm và anchor của tầng 1
  function calculateProductAndAnchorCounts() {
    var productCount = 0;
    var anchorCount = 0;

    // Tính tổng số lượng sản phẩm
    db.ref(`/${building}/${stage}/product`).once(
      "value",
      function (productSnapshot) {
        productCount = productSnapshot.numChildren();
        // Cập nhật nội dung của nút Floor 1
        updateStageButtonContent(productCount, anchorCount);
      }
    );

    // Tính tổng số lượng anchor
    db.ref(`/${building}/${stage}/anchor`).once(
      "value",
      function (anchorSnapshot) {
        anchorCount = anchorSnapshot.numChildren();
        // Cập nhật nội dung của nút Floor 1
        updateStageButtonContent(productCount, anchorCount);
      }
    );
  }

  calculateProductAndAnchorCounts();
};

const hideAllInFloors = () => {
  floors.style.display = "none";
  for (let element of maps) {
    element.style.display = "none";
  }
  for (let element of floorInfoContainers) {
    element.style.display = "none";
  }
  for (let element of rectangles) {
    element.style.display = "none";
  }
  document.querySelectorAll(".product").forEach(function (product) {
    product.style.display = "none";
  });
  document.querySelectorAll(".anchor").forEach(function (anchor) {
    anchor.style.display = "none";
  });
};
export { floor, hideAllInFloors };
