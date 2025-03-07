(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const $ = (selector) => document.querySelector(selector);
const DOM = {
  $body: $("body"),
  $main: $("main"),
  $gnbButton: $(".gnb__button"),
  $cancelButton: $("#cancel__button"),
  $addButton: $("#add__button"),
  $header: $(".gnb"),
  $buttonContainer: $(".button-container"),
  $restaurantList: $(".restaurant-list"),
  $modalForm: $(".modal form"),
  $modal: $(".modal"),
  $modalContainer: $(".modal-container")
};
const IconButton = {
  create({ src, onClick, label }) {
    const IconButtonElement = document.createElement("button");
    IconButtonElement.setAttribute("type", "button");
    IconButtonElement.setAttribute("class", "gnb__button");
    IconButtonElement.setAttribute("aria-label", label);
    IconButtonElement.addEventListener("click", onClick);
    IconButtonElement.innerHTML = `<img src=${src} alt=${label} />`;
    return IconButtonElement;
  }
};
const InputForm = {
  create({ id, label, isRequired, bottomDescription }) {
    const InputFormElement = document.createElement("div");
    InputFormElement.classList.add("form-item");
    if (isRequired) InputFormElement.classList.add("form-item--required");
    InputFormElement.innerHTML = `
                <label for="${id} text-caption">${label}</label>
                <input type="text" name=${id} id=${id}  ${isRequired ? "required" : ""}  />
                ${bottomDescription === "" ? "" : `<span class='help-text text-caption'>${bottomDescription}</span>`}
    `;
    return InputFormElement;
  }
};
const SelectForm = {
  create({ id, label, dropdownList, isRequired }) {
    const SelectFormElement = document.createElement("div");
    SelectFormElement.classList.add("form-item");
    if (isRequired) SelectFormElement.classList.add("form-item--required");
    SelectFormElement.innerHTML = `
            <label for="${id} text-caption">${label}</label>
              <select name=${id} id=${id} ${isRequired ? "required" : ""} >
              ${dropdownList.map(
      ({ label: label2, value }) => `<option value="${value}">${label2}</option>`
    ).join("\n")}
              </select>
  `;
    return SelectFormElement;
  }
};
const TextareaForm = {
  create({ id, bottomDescription, rows, label, isRequired }) {
    const TextareaFormElement = document.createElement("div");
    TextareaFormElement.setAttribute("class", "form-item");
    if (isRequired) TextareaFormElement.classList.add("form-item--required");
    TextareaFormElement.innerHTML = `
                <label for="${id} text-caption" >${label}</label>
                <Textarea
                  name=${id}
                  id=${id}
                  cols="30"
                  rows=${rows}
                  ${isRequired ? "required" : ""}
                ></Textarea>
                <span class="help-text text-caption"
                  >${bottomDescription}</span
                >
                `;
    return TextareaFormElement;
  }
};
const TextButton = {
  create({ title, onClick, id }) {
    const TextButtonElement = document.createElement("button");
    TextButtonElement.setAttribute("id", id);
    TextButtonElement.setAttribute("class", "button");
    TextButtonElement.setAttribute("type", "button");
    TextButtonElement.classList.add("text-caption");
    if (id === "cancel__button")
      TextButtonElement.classList.add("button--secondary");
    if (id === "add__button") {
      TextButtonElement.setAttribute("type", "submit");
      TextButtonElement.classList.add("button--primary");
    }
    TextButtonElement.addEventListener("click", onClick);
    TextButtonElement.innerText = title;
    return TextButtonElement;
  }
};
const ButtonContainer = {
  create() {
    const buttonContainerElement = document.createElement("div");
    buttonContainerElement.classList.add("button-container");
    buttonContainerElement.appendChild(
      TextButton.create({
        id: "cancel__button",
        title: "취소하기",
        onClick: () => Modal.close()
      })
    );
    buttonContainerElement.appendChild(
      TextButton.create({
        id: "add__button",
        title: "추가하기"
      })
    );
    return buttonContainerElement;
  }
};
function render(element, dom) {
  dom.append(element);
}
const CATEGORY_ICON = {
  한식: "./category-korean.png",
  중식: "./category-chinese.png",
  일식: "./category-japanese.png",
  양식: "./category-western.png",
  아시안: "./category-asian.png",
  기타: "./category-etc.png"
};
const RESTAURANT_NAME_LENGTH_MAX = 30;
const DESCRIPTION_LENGTH_MAX = 200;
const ERROR_MESSAGE = {
  NAME_LENGTH_MAX: `가게 이름은 ${RESTAURANT_NAME_LENGTH_MAX}자를 넘을 수 없습니다.`,
  DESCRIPTION_MAX: `설명은 ${DESCRIPTION_LENGTH_MAX}자를 넘을 수 없습니다.`,
  LINK: "유효하지 않은 링크입니다."
};
const state = {
  restaurantList: [
    {
      src: "./category-korean.png",
      name: "피양콩할마니",
      distance: "10",
      description: `평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩
                        할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은
                        평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선
                        맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은
                        건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만,
                        할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의
                        역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은
                        만큼 덜어 먹을 수 있게 준비돼 있다.`,
      label: "한식"
    },
    {
      src: "./category-chinese.png",
      name: "친친",
      distance: "5",
      description: `Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과
                    정성으로 정통 중식의 세계를 펼쳐갑니다`,
      label: "중식"
    },
    {
      src: "./category-japanese.png",
      name: "잇쇼우",
      distance: "10",
      description: `잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은
                    정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는
                    잇쇼우는 고객 한분 한분께 최선을 다하겠습니다`,
      label: "일식"
    },
    {
      src: "./category-western.png",
      name: "이태리키친",
      distance: "20",
      description: `늘 변화를 추구하는 이태리키친입니다.`,
      label: "양식"
    },
    {
      src: "./category-asian.png",
      name: "호야빈 삼성점",
      distance: "15",
      description: `푸짐한 양에 국물이 일품인 쌀국수`,
      label: "아시안"
    },
    {
      src: "./category-etc.png",
      name: "도스타코스 선릉점",
      distance: "5",
      description: `멕시칸 캐주얼 그릴`,
      label: "기타"
    }
  ]
};
const Validator = {
  name(name) {
    if (name.length > RESTAURANT_NAME_LENGTH_MAX) {
      throw new Error(ERROR_MESSAGE.NAME_LENGTH_MAX);
    }
  },
  description(description) {
    if (description.length > DESCRIPTION_LENGTH_MAX) {
      throw new Error(ERROR_MESSAGE.DESCRIPTION_MAX);
    }
  },
  link(link) {
    const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i;
    if (!urlRegex.test(link)) {
      throw new Error(ERROR_MESSAGE.LINK);
    }
  }
};
const AddLunchModalForm = {
  create() {
    const ModalFormElement = document.createElement("form");
    ModalFormElement.innerHTML = `<h2 class="modal-title text-title">새로운 음식점</h2>`;
    ModalFormElement.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const { category, description, distance, link, name } = Object.fromEntries(formData.entries());
      try {
        Validator.name(name);
        if (link !== "") Validator.link(link);
        if (description !== "") Validator.description(description);
        state.restaurantList.push({
          src: CATEGORY_ICON[category],
          name,
          distance,
          description,
          label: category
        });
        renderRestaurantList();
        Modal.close();
      } catch (e) {
        alert(e.message);
      }
    });
    ModalFormElement.appendChild(
      SelectForm.create({
        id: "category",
        label: "카테고리",
        dropdownList: [
          {
            value: "",
            label: "선택해 주세요"
          },
          {
            value: "한식",
            label: "한식"
          },
          {
            value: "중식",
            label: "중식"
          },
          {
            value: "일식",
            label: "일식"
          },
          {
            value: "양식",
            label: "양식"
          },
          {
            value: "아시안",
            label: "아시안"
          },
          {
            value: "기타",
            label: "기타"
          }
        ],
        isRequired: true
      })
    );
    ModalFormElement.appendChild(
      InputForm.create({
        id: "name",
        label: "이름",
        isRequired: true,
        bottomDescription: ""
      })
    );
    ModalFormElement.appendChild(
      SelectForm.create({
        id: "distance",
        label: "거리(도보 이동 시간)",
        dropdownList: [
          {
            value: "",
            label: "선택해 주세요"
          },
          {
            value: "5",
            label: "5분 내"
          },
          {
            value: "10",
            label: "10분 내"
          },
          {
            value: "15",
            label: "15분 내"
          },
          {
            value: "20",
            label: "20분 내"
          },
          {
            value: "30",
            label: "30분 내"
          }
        ],
        isRequired: true
      })
    );
    ModalFormElement.appendChild(
      TextareaForm.create({
        id: "description",
        bottomDescription: "메뉴 등 추가 정보를 입력해 주세요.",
        rows: "5",
        label: "설명",
        isRequired: false
      })
    );
    ModalFormElement.appendChild(
      InputForm.create({
        id: "link",
        label: "참고 링크",
        isRequired: false,
        bottomDescription: "매장 정보를 확인할 수 있는 링크를 입력해 주세요."
      })
    );
    ModalFormElement.appendChild(ButtonContainer.create());
    return ModalFormElement;
  }
};
const Modal = {
  create(modalContent) {
    const modalElement = document.createElement("div");
    modalElement.classList.add("modal");
    modalElement.appendChild(this.createModalBackdrop());
    modalElement.appendChild(this.createModalContainer(modalContent));
    return modalElement;
  },
  createModalBackdrop() {
    const modalBackdropElement = document.createElement("div");
    modalBackdropElement.classList.add("modal-backdrop");
    modalBackdropElement.addEventListener("click", () => Modal.close());
    return modalBackdropElement;
  },
  createModalContainer(modalContent) {
    const modalContainerElement = document.createElement("div");
    modalContainerElement.classList.add("modal-container");
    modalContainerElement.appendChild(modalContent);
    return modalContainerElement;
  },
  open() {
    $(".modal").classList.add("modal--open");
  },
  close() {
    $(".modal").classList.remove("modal--open");
  }
};
const LunchInfoCard = {
  create({ src, name, label, distance, description }) {
    const LunchInfoCardElement = document.createElement("li");
    LunchInfoCardElement.setAttribute("class", "restaurant");
    LunchInfoCardElement.innerHTML = `
          <div class="restaurant__category">
              <img src=${src} alt=${label} />
          </div>
          <div class="restaurant__info">
              <h3 class="restaurant__name text-subtitle">${name}</h3>
              <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
              <p class="restaurant__description text-body">${description}</p>
          </div>
    `;
    return LunchInfoCardElement;
  }
};
const Header = {
  create() {
    const headerElement = document.createElement("header");
    headerElement.classList.add("gnb");
    headerElement.innerHTML = `<h1 class="gnb__title text-title">점심 뭐 먹지</h1>`;
    headerElement.appendChild(
      IconButton.create({
        src: "./add-button.png",
        onClick: () => Modal.open(),
        label: "음식점 추가"
      })
    );
    return headerElement;
  }
};
addEventListener("keydown", (e) => {
  if (e.key === "Escape") Modal.close();
});
DOM.$body.prepend(Header.create());
renderRestaurantList();
DOM.$main.append(Modal.create(AddLunchModalForm.create()));
function renderRestaurantList() {
  DOM.$restaurantList.replaceChildren();
  state.restaurantList.forEach(
    ({ src, name, distance, description, label }) => {
      render(
        LunchInfoCard.create({ src, name, distance, description, label }),
        DOM.$restaurantList
      );
    }
  );
}
