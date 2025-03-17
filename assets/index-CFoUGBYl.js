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
const $$ = (selector) => document.querySelectorAll(selector);
const DOM = {
  $body: $("body"),
  $main: $("main"),
  $filterContainer: $(".restaurant-filter-container"),
  $restaurantContainer: $(".restaurant-list-container"),
  $favoriteContainer: $(".favorite-list-container")
};
const Modal = {
  create(id, modalContent) {
    const modalElement = document.createElement("div");
    modalElement.id = id;
    modalElement.classList.add("modal");
    modalElement.appendChild(this.createModalBackdrop(id));
    modalElement.appendChild(this.createModalContainer(modalContent));
    return modalElement;
  },
  createModalBackdrop(id) {
    const modalBackdropElement = document.createElement("div");
    modalBackdropElement.classList.add("modal-backdrop");
    modalBackdropElement.addEventListener("click", () => Modal.close(id));
    return modalBackdropElement;
  },
  createModalContainer(modalContent) {
    const modalContainerElement = document.createElement("div");
    modalContainerElement.classList.add("modal-container");
    modalContainerElement.appendChild(modalContent);
    return modalContainerElement;
  },
  open(id) {
    $(`.modal[id=${id}]`).classList.add("modal--open");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") Modal.close(id);
    });
  },
  close(id) {
    $(`.modal[id=${id}]`).classList.remove("modal--open");
    document.removeEventListener("keydown", (e) => {
      if (e.key === "Escape") Modal.close(id);
    });
  },
  reset(id) {
    $$(`.modal[id=${id}] input`).forEach((input) => input.value = "");
    $$(`.modal[id=${id}] select`).forEach((select) => select.value = "");
    $$(`.modal[id=${id}] textarea`).forEach(
      (textarea) => textarea.value = ""
    );
  }
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
const Header = {
  create() {
    const headerElement = document.createElement("header");
    headerElement.classList.add("gnb");
    headerElement.innerHTML = `<h1 class="gnb__title text-title">점심 뭐 먹지</h1>`;
    headerElement.appendChild(
      IconButton.create({
        src: "./add-button.png",
        onClick: () => Modal.open("addLunch"),
        label: "음식점 추가"
      })
    );
    return headerElement;
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
  create({ title, onClick, id }, type) {
    const TextButtonElement = document.createElement("button");
    TextButtonElement.setAttribute("id", id);
    TextButtonElement.setAttribute("class", "button");
    TextButtonElement.setAttribute("type", "button");
    TextButtonElement.classList.add("text-caption");
    if (type === "secondary")
      TextButtonElement.classList.add("button--secondary");
    if (type === "primary") {
      TextButtonElement.setAttribute("type", "submit");
      TextButtonElement.classList.add("button--primary");
    }
    TextButtonElement.addEventListener("click", onClick);
    TextButtonElement.innerText = title;
    return TextButtonElement;
  }
};
const AddLunchButtonContainer = {
  create() {
    const buttonContainerElement = document.createElement("div");
    buttonContainerElement.classList.add("button-container");
    buttonContainerElement.appendChild(
      TextButton.create(
        {
          id: "cancel__button",
          title: "취소하기",
          onClick: () => Modal.close("addLunch")
        },
        "secondary"
      )
    );
    buttonContainerElement.appendChild(
      TextButton.create(
        {
          id: "add__button",
          title: "추가하기"
        },
        "primary"
      )
    );
    return buttonContainerElement;
  }
};
const CATEGORY_DROPDOWN_LIST = [
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
];
const DISTANCE_DROPDOWN_LIST = [
  {
    value: "",
    label: "선택해 주세요"
  },
  {
    value: 5,
    label: "5분 내"
  },
  {
    value: 10,
    label: "10분 내"
  },
  {
    value: 15,
    label: "15분 내"
  },
  {
    value: 20,
    label: "20분 내"
  },
  {
    value: 30,
    label: "30분 내"
  }
];
const CATEGORY_FILTER_DROPDOWN_LIST = [
  {
    value: "전체",
    label: "전체"
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
];
const SORT_FILTER_DROPDOWN_LIST = [
  {
    value: "id",
    label: "추가순"
  },
  {
    value: "name",
    label: "이름순"
  },
  {
    value: "distance",
    label: "거리순"
  }
];
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
const RESTAURANT_LIST_KEY = "restaurantList";
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
const RestaurantListUtils = {
  add(restaurantList, newRestaurant) {
    return [...restaurantList, newRestaurant];
  },
  delete(restaurantList, id) {
    return restaurantList.filter((restaurant) => restaurant.id !== id);
  },
  filterByCategory(restaurantList, category) {
    if (category === "전체") return restaurantList;
    return restaurantList.filter(({ label }) => label === category);
  },
  sortById(restaurantList) {
    const resultList = [...restaurantList];
    return resultList.sort((a, b) => a.id - b.id);
  },
  sortByName(restaurantList) {
    const resultList = [...restaurantList];
    return resultList.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  },
  sortByDistance(restaurantList) {
    const resultList = [...restaurantList];
    return resultList.sort((a, b) => a.distance - b.distance);
  },
  favoriteById(restaurantList, id) {
    return restaurantList.map(
      (restaurant) => restaurant.id === id ? { ...restaurant, favorite: !restaurant.favorite } : restaurant
    );
  },
  getFavoriteList(restaurantList) {
    return restaurantList.filter(({ favorite }) => favorite);
  }
};
const LocalStorage = {
  setJSON(key, JSONdata) {
    localStorage.setItem(key, JSON.stringify(JSONdata));
  },
  getJSON(key) {
    const data2 = localStorage.getItem(key);
    if (data2) return JSON.parse(data2);
    return null;
  }
};
const state = {
  currentRestaurantList: [],
  setCurrentRestaurantList(restaurantList) {
    this.currentRestaurantList = restaurantList;
  }
};
const DetailModalButtonContainer = {
  create() {
    const buttonContainerElement = document.createElement("div");
    buttonContainerElement.classList.add("button-container");
    buttonContainerElement.appendChild(
      TextButton.create(
        {
          id: "delete__button",
          title: "삭제하기"
        },
        "secondary"
      )
    );
    buttonContainerElement.appendChild(
      TextButton.create(
        {
          id: "close__button",
          title: "닫기",
          onClick: () => Modal.close("detail")
        },
        "primary"
      )
    );
    return buttonContainerElement;
  }
};
const DetailModalContent = {
  create() {
    const DetailModalContent2 = document.createElement("div");
    const DetailModalList = document.createElement("li");
    DetailModalList.setAttribute("class", "restaurant-detail");
    DetailModalContent2.appendChild(DetailModalList);
    DetailModalContent2.appendChild(DetailModalButtonContainer.create());
    return DetailModalContent2;
  },
  set({ id, favorite, src, label, name, distance, description, link }) {
    $(".restaurant-detail").innerHTML = /*html*/
    `
    <img id=${id} class="restaurant__favorite" src=${favorite ? "./favorite-icon-filled.png" : "./favorite-icon-lined.png"} alt=${favorite ? "favoriteIcon" : "noFavoriteIcon"} />
    <div class="restaurant__category">
        <img src=${src} alt=${label} />
    </div>
    <div class="restaurant__info">
        <h3 class="restaurant__name text-subtitle">${name}</h3>
        <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
        <p class="restaurant__description-detail text-body">${description}</p>
        <p class="restaurant__link text-body">${link ? link : ""}</p>
    </div>
  `;
    this.handleDeleteButton(id);
    this.handleFavoriteButton();
  },
  handleDeleteButton(id) {
    $("#delete__button").onclick = () => {
      const deletedList = RestaurantListUtils.delete(
        LocalStorage.getJSON(RESTAURANT_LIST_KEY),
        id
      );
      LocalStorage.setJSON(RESTAURANT_LIST_KEY, deletedList);
      this.renderAll();
      Modal.close("detail");
    };
  },
  handleFavoriteButton() {
    $(".restaurant-detail .restaurant__favorite").addEventListener(
      "click",
      (e) => {
        e.target.id;
        e.target.alt;
        this.changeIcon(e.target);
        const favoriteList = RestaurantListUtils.favoriteById(
          LocalStorage.getJSON(RESTAURANT_LIST_KEY),
          Number(e.target.id)
        );
        LocalStorage.setJSON(RESTAURANT_LIST_KEY, favoriteList);
        state.setCurrentRestaurantList(
          RestaurantListUtils.favoriteById(
            state.currentRestaurantList,
            Number(e.target.id)
          )
        );
        this.renderAll();
      }
    );
  },
  changeIcon(target) {
    const alt = target.alt;
    if (alt == "favoriteIcon") {
      target.alt = "noFavoriteIcon";
      target.src = "./favorite-icon-lined.png";
    }
    if (alt == "noFavoriteIcon") {
      target.alt = "favoriteIcon";
      target.src = "./favorite-icon-filled.png";
    }
  },
  renderAll() {
    FilterSelect.applyFilter("allRestaurant");
    const favoriteRestaurantList = RestaurantListUtils.getFavoriteList(
      LocalStorage.getJSON(RESTAURANT_LIST_KEY)
    );
    RestaurantList.applyList("favoriteRestaurant", favoriteRestaurantList);
  }
};
const LunchInfoCard = {
  create({ id, src, name, label, distance, description, favorite, link }) {
    const LunchInfoCardElement = document.createElement("li");
    LunchInfoCardElement.setAttribute("class", "restaurant");
    LunchInfoCardElement.innerHTML = /*html*/
    `
      <img id=${id} class="restaurant__favorite" src=${favorite ? "./favorite-icon-filled.png" : "./favorite-icon-lined.png"} alt=${favorite ? "favoriteIcon" : "noFavoriteIcon"} />
      <div class="restaurant__category">
          <img src=${src} alt=${label} />
      </div>
      <div class="restaurant__info">
          <h3 class="restaurant__name text-subtitle">${name}</h3>
          <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
          <p class="restaurant__description text-body">${description}</p>
      </div>
    `;
    LunchInfoCardElement.addEventListener("click", (e) => {
      if (e.target.classList.contains("restaurant__favorite")) return;
      Modal.open("detail");
      DetailModalContent.set({
        id,
        src,
        label,
        name,
        distance,
        description,
        link,
        favorite
      });
    });
    return LunchInfoCardElement;
  },
  onClickFavorite(id, event) {
  },
  onClickCard(id, event) {
  }
};
const RestaurantList = {
  create(id) {
    const restaurantListElement = document.createElement("ul");
    restaurantListElement.id = id;
    restaurantListElement.classList.add("restaurant-list");
    restaurantListElement.addEventListener(
      "click",
      (e) => this.onClickFavorite(id, e)
    );
    return restaurantListElement;
  },
  onClickFavorite(restaurantListId, event) {
    const target = event.target;
    if (!target.classList.contains("restaurant__favorite")) return;
    const favoriteList = RestaurantListUtils.favoriteById(
      LocalStorage.getJSON(RESTAURANT_LIST_KEY),
      Number(target.id)
    );
    LocalStorage.setJSON(RESTAURANT_LIST_KEY, favoriteList);
    state.setCurrentRestaurantList(
      RestaurantListUtils.favoriteById(
        state.currentRestaurantList,
        Number(target.id)
      )
    );
    this.applyState(restaurantListId);
  },
  applyData(restaurantListId) {
    this.applyList(restaurantListId, LocalStorage.getJSON(RESTAURANT_LIST_KEY));
  },
  applyState(restaurantListId) {
    this.applyList(restaurantListId, state.currentRestaurantList);
  },
  applyList(restaurantListId, restaurantList) {
    state.setCurrentRestaurantList(restaurantList);
    const restaurantElementList = this.getRestaurantElementList(restaurantList);
    this.applyElements(restaurantListId, restaurantElementList);
  },
  applyElements(restaurantListId, elements) {
    $(`.restaurant-list[id=${restaurantListId}]`).replaceChildren();
    elements.forEach(
      (element) => $(`.restaurant-list[id=${restaurantListId}]`).appendChild(element)
    );
  },
  getRestaurantElementList(restaurantList) {
    return restaurantList.map(
      ({ id, name, distance, description, label, favorite, link }) => LunchInfoCard.create({
        id,
        src: CATEGORY_ICON[label],
        label,
        name,
        distance,
        description,
        link,
        favorite
      })
    );
  }
};
const FilterSelect = {
  create({ id, name, dropdownList }) {
    const filterElement = document.createElement("select");
    filterElement.id = id;
    filterElement.name = name;
    filterElement.classList.add("restaurant-filter");
    filterElement.innerHTML = /*html*/
    `
    ${dropdownList.map(({ label, value }) => `<option value="${value}">${label}</option>`).join("\n")}
    `;
    filterElement.addEventListener(
      "change",
      (e) => this.applyFilter("allRestaurant")
    );
    return filterElement;
  },
  applyFilter(restaurantListId) {
    const category = $("#category-filter").value;
    const sortingRule = $("#sorting-filter").value;
    const filteredListByCategory = this.getFilteredListByCategory(
      LocalStorage.getJSON(RESTAURANT_LIST_KEY),
      category
    );
    const filteredListByBoth = this.getFilteredListBySorting(
      filteredListByCategory,
      sortingRule
    );
    RestaurantList.applyList(restaurantListId, filteredListByBoth);
  },
  getFilteredListByCategory(restaurantList, category) {
    const filteredList = RestaurantListUtils.filterByCategory(
      restaurantList,
      category
    );
    return filteredList;
  },
  getFilteredListBySorting(restaurantList, sortingRule) {
    let filteredList = [...restaurantList];
    if (sortingRule === "id")
      filteredList = RestaurantListUtils.sortById(filteredList);
    if (sortingRule === "name")
      filteredList = RestaurantListUtils.sortByName(filteredList);
    if (sortingRule === "distance")
      filteredList = RestaurantListUtils.sortByDistance(filteredList);
    return filteredList;
  }
};
const AddLunchModalForm = {
  create() {
    const ModalFormElement = document.createElement("form");
    ModalFormElement.innerHTML = `<h2 class="modal-title text-title">새로운 음식점</h2>`;
    ModalFormElement.addEventListener(
      "submit",
      (event) => this.handleSubmit(event)
    );
    ModalFormElement.appendChild(
      SelectForm.create({
        id: "category",
        label: "카테고리",
        dropdownList: CATEGORY_DROPDOWN_LIST,
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
        dropdownList: DISTANCE_DROPDOWN_LIST,
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
    ModalFormElement.appendChild(AddLunchButtonContainer.create());
    return ModalFormElement;
  },
  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { category, description, distance, link, name } = Object.fromEntries(
      formData.entries()
    );
    try {
      this.validateFormInputs({ name, link, description });
      this.addRestaurant({ category, name, distance, description, link });
      FilterSelect.applyFilter("allRestaurant");
      Modal.close("addLunch");
      Modal.reset("addLunch");
    } catch (e) {
      alert(e.message);
    }
  },
  validateFormInputs({ name, link, description }) {
    Validator.name(name);
    if (link !== "") Validator.link(link);
    if (description !== "") Validator.description(description);
  },
  addRestaurant({ category, name, distance, description, link }) {
    const dataList = LocalStorage.getJSON(RESTAURANT_LIST_KEY);
    const addList = RestaurantListUtils.add(dataList, {
      id: dataList[dataList.length - 1].id + 1,
      label: category,
      name,
      distance,
      description,
      link
    });
    LocalStorage.setJSON(RESTAURANT_LIST_KEY, addList);
  }
};
const data = {
  restaurantList: [
    {
      id: 0,
      label: "한식",
      name: "피양콩할마니",
      distance: 10,
      description: `평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩
                    할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은
                    평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선
                    맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은
                    건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만,
                    할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의
                    역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은
                    만큼 덜어 먹을 수 있게 준비돼 있다.`,
      favorite: false
    },
    {
      id: 1,
      label: "중식",
      name: "친친",
      distance: 5,
      description: `Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과
                      정성으로 정통 중식의 세계를 펼쳐갑니다`,
      favorite: false
    },
    {
      id: 2,
      label: "일식",
      name: "잇쇼우",
      distance: 10,
      description: `잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은
                      정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는
                      잇쇼우는 고객 한분 한분께 최선을 다하겠습니다`,
      favorite: false
    },
    {
      id: 3,
      label: "양식",
      name: "이태리키친",
      distance: 20,
      description: `늘 변화를 추구하는 이태리키친입니다.`,
      favorite: false
    },
    {
      id: 4,
      label: "아시안",
      name: "호야빈 삼성점",
      distance: 15,
      description: `푸짐한 양에 국물이 일품인 쌀국수`,
      favorite: false
    },
    {
      id: 5,
      label: "기타",
      name: "도스타코스 선릉점",
      distance: 5,
      description: `멕시칸 캐주얼 그릴`,
      favorite: false
    }
  ]
};
DOM.$body.prepend(Header.create());
initLocalStorage();
initNavigationButton();
initFilterSelect();
initRestaurantList();
initFavoriteList();
initAddLunchModal();
initDetailModal();
function initLocalStorage() {
  if (LocalStorage.getJSON(RESTAURANT_LIST_KEY) === null)
    LocalStorage.setJSON(RESTAURANT_LIST_KEY, data.restaurantList);
}
function initNavigationButton() {
  $(".navigation-bar-container").addEventListener("click", (e) => {
    $$("main section").forEach((section) => section.style.display = "none");
    if (e.target.classList.contains("all_restaurant_nav")) {
      FilterSelect.applyFilter("allRestaurant");
      DOM.$filterContainer.style.display = "flex";
      DOM.$restaurantContainer.style.display = "block";
    }
    if (e.target.classList.contains("favorite_restaurant_nav")) {
      const favoriteRestaurantList = RestaurantListUtils.getFavoriteList(
        LocalStorage.getJSON(RESTAURANT_LIST_KEY)
      );
      RestaurantList.applyList("favoriteRestaurant", favoriteRestaurantList);
      DOM.$favoriteContainer.style.display = "block";
    }
    $$(".navigation__button").forEach(
      (btn) => btn.classList.remove("activated")
    );
    e.target.classList.add("activated");
  });
}
function initFilterSelect() {
  const categoryFilter = FilterSelect.create({
    id: "category-filter",
    name: "category",
    dropdownList: CATEGORY_FILTER_DROPDOWN_LIST
  });
  const sortingFilter = FilterSelect.create({
    id: "sorting-filter",
    name: "sorting",
    dropdownList: SORT_FILTER_DROPDOWN_LIST
  });
  DOM.$filterContainer.append(categoryFilter);
  DOM.$filterContainer.append(sortingFilter);
}
function initRestaurantList() {
  DOM.$restaurantContainer.append(RestaurantList.create("allRestaurant"));
  RestaurantList.applyData("allRestaurant");
}
function initFavoriteList() {
  DOM.$favoriteContainer.append(RestaurantList.create("favoriteRestaurant"));
}
function initAddLunchModal() {
  const addLunchModalContent = AddLunchModalForm.create();
  const addLunchModalElement = Modal.create("addLunch", addLunchModalContent);
  DOM.$main.append(addLunchModalElement);
}
function initDetailModal() {
  const detailModalContent = DetailModalContent.create();
  const detailModalElement = Modal.create("detail", detailModalContent);
  DOM.$main.append(detailModalElement);
}
