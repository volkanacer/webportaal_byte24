import axios from "axios";
import React, { Fragment, useState, useEffect } from "react";
import { API_URL } from "../../constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import nookies from "nookies";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import { Dialog, Transition, Menu } from "@headlessui/react";

//**************************************************************** DIT STUK
export default function Urenoverzicht() {
  const [user, setUser] = useState([]);
  const [beginDate, setBeginDate] = useState("");
  const [beginUren, setBeginUren] = useState("");
  const [endUren, setEndUren] = useState("");
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [breakUren, setBreakUren] = useState(
    setHours(setMinutes(new Date(), 0), 0)
  );
  const [medewerkers, setMedewerkers] = useState([]);
  const [medewerker, setMedewerker] = useState(null);
  const [periodeMaand, setPeriodeMaand] = useState(null);
  const [uren, setUren] = useState([]);
  const cookies = nookies.get();
  const [clickedHour, setClickedHour] = useState();

  const ApiConfig = {
    headers: {
      "x-auth-token": cookies.jwt,
    },
  };

  const getUren = async () => {
    // ingevoerde uren ophalen
    try {
      const response = await axios.get(`${API_URL}/admin/urenuren`, ApiConfig);
      //Naam is opgebouwd uit first_name en last_name
      console.log(response.data);
      setUren(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getUrenMedewerker = async () => {
    // Specifiek medewerker uren zien
    try {
      const response = await axios.get(
        `${API_URL}/admin/urenuren/${medewerker}`,
        ApiConfig
      );
      //Check hier ook de console log

      setUren(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getUrenPeriodeMaand = async () => {
    // Specifiek periode uren zien
    try {
      const response = await axios.post(
        `${API_URL}/admin/uren-filter`,
        ApiConfig
      );
      //Check hier ook of de first en last_name aanwezig zijn in de response
      console.log(response.data);
      setUren(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const onDelete = async () => {
    // Verwijderen van ingevoerde uren & vragen of de gebruiker het werkelijk wil verwijderen.
    try {
      await axios.post(
        `${API_URL}/admin/uren-verwijderen`,
        {
          id: clickedHour,
        },
        ApiConfig
      );
      setOpen(false);

      getUren();
    } catch (e) {
      console.log(e);
    }
  };

  const onUpdate = async () => {
    // Updaten van opgegeven uren
    try {
      await axios.post(
        `${API_URL}/admin/uren-updaten`,
        {
          start_date: beginDate,
          start_hour: beginUren,
          end_hour: endUren,
          break_hour: breakUren,
          id: clickedHour,
        },
        ApiConfig
      );
      setOpenUpdate(false);

      getUren();
    } catch (e) {
      console.log(e);
    }
  };

  const getSelectedMedewerker = async () => {
    // Medewerker selecteren uit database in de lijst met medewerkers
    try {
      const response = await axios.get(
        `${API_URL}/admin/medewerker-filter`,
        ApiConfig
      );
      console.log(response.data);
      setMedewerkers(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const combineMedewerkerMaand = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/medewerker-maand`,
        ApiConfig
      );
      console.log(response.data);
      getUrenPeriodeMaand(response.data);
      setMedewerkers(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUren();
    getSelectedMedewerker();
    combineMedewerkerMaand();
  }, []);

  useEffect(() => {
    if (medewerker) {
      getUrenMedewerker();
    }
  }, [medewerker]);

  useEffect(() => {
    if (periodeMaand) {
      getUrenPeriodeMaand();
    }
  }, [periodeMaand]);

  function mobileMenu(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  function totalHourCalc(a, b, c) {
    return (
      parseInt(a.toString().replace(":", ".")) -
      parseInt(b.toString().replace(":", ".")) -
      parseFloat(c.toString().replace(":", ".").replace("3", "5"))
    );
  }

  const monthlyWorkedHours = (arr) => {
    const res = arr.map((uur, index) => {
      const response = totalHourCalc(
        uur.end_hour,
        uur.start_hour,
        uur.break_hour
      );
      return response;
    });

    const result = res.reduce((a, b) => a + b, 0);

    return result;
  };

  return (
    <body class="antialiased bg-body text-body font-body">
      <div class="">
        <div>
          <nav class="lg:hidden py-6 px-6 bg-gray-800">
            <div class="flex items-center justify-between">
              <Menu as="div" className="relative m-auto text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2  text-sm font-medium text-white hover:bg-gray-700 focus:outline-none   ">
                    Menu
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="m-auto origin-top-right  right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/admin"
                            className={mobileMenu(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            Dashboard
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="../admin/email"
                            className={mobileMenu(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            Inbox
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="../admin/medewerkerlijst"
                            className={mobileMenu(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            Users
                          </a>
                        )}
                      </Menu.Item>
                      <form method="POST" action="/">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="submit"
                              className={mobileMenu(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Log out
                            </button>
                          )}
                        </Menu.Item>
                      </form>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </nav>
          <div class="hidden lg:block navbar-menu relative z-50">
            <div class="navbar-backdrop fixed lg:hidden inset-0 bg-gray-800 opacity-10"></div>
            <nav class="fixed top-0 left-0 bottom-0 flex flex-col w-3/4 lg:w-80 sm:max-w-xs pt-6 pb-8 bg-gray-800 overflow-y-auto">
              <div class="flex w-full items-center px-6 pb-6 mb-6 lg:border-b border-gray-700"></div>
              <div class="px-4 pb-6">
                <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium">
                  Menu
                </h3>
                <ul class="mb-8 text-sm font-medium">
                  <li>
                    <a
                      class="flex items-center pl-3 py-3 pr-4 text-gray-50 bg-indigo-500 rounded"
                      href="/admin"
                    >
                      <span class="inline-block mr-3">
                        <svg
                          class="text-indigo-100 w-5 h-5"
                          viewbox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.9066 3.12873C14.9005 3.12223 14.8987 3.11358 14.8923 3.10722C14.8859 3.10086 14.8771 3.09893 14.8706 3.09278C13.3119 1.53907 11.2008 0.666626 8.99996 0.666626C6.79914 0.666626 4.68807 1.53907 3.12935 3.09278C3.12279 3.09893 3.11404 3.10081 3.10763 3.10722C3.10122 3.11363 3.09944 3.12222 3.09334 3.12873C1.93189 4.29575 1.14217 5.78067 0.823851 7.39609C0.505534 9.01151 0.672885 10.685 1.30478 12.2054C1.93668 13.7258 3.00481 15.025 4.37435 15.9389C5.7439 16.8528 7.35348 17.3405 8.99996 17.3405C10.6464 17.3405 12.256 16.8528 13.6256 15.9389C14.9951 15.025 16.0632 13.7258 16.6951 12.2054C17.327 10.685 17.4944 9.01151 17.1761 7.39609C16.8578 5.78067 16.068 4.29575 14.9066 3.12873ZM8.99992 15.6666C8.00181 15.6663 7.01656 15.4414 6.11714 15.0087C5.21773 14.5759 4.42719 13.9464 3.80409 13.1666H7.15015C7.38188 13.4286 7.66662 13.6383 7.98551 13.782C8.3044 13.9257 8.65017 14 8.99992 14C9.34968 14 9.69544 13.9257 10.0143 13.782C10.3332 13.6383 10.618 13.4286 10.8497 13.1666H14.1958C13.5727 13.9464 12.7821 14.5759 11.8827 15.0087C10.9833 15.4414 9.99804 15.6663 8.99992 15.6666ZM8.16659 11.5C8.16659 11.3351 8.21546 11.174 8.30703 11.037C8.3986 10.8999 8.52875 10.7931 8.68102 10.7301C8.83329 10.667 9.00085 10.6505 9.1625 10.6826C9.32415 10.7148 9.47263 10.7942 9.58918 10.9107C9.70572 11.0272 9.78509 11.1757 9.81724 11.3374C9.8494 11.499 9.83289 11.6666 9.76982 11.8189C9.70675 11.9711 9.59994 12.1013 9.4629 12.1929C9.32586 12.2844 9.16474 12.3333 8.99992 12.3333C8.77898 12.3331 8.56714 12.2452 8.41091 12.089C8.25468 11.9327 8.16681 11.7209 8.16659 11.5ZM15.1751 11.5017L15.1665 11.5H11.4999C11.4983 10.9846 11.3373 10.4824 11.0389 10.0623C10.7405 9.64218 10.3193 9.32472 9.83325 9.15352V6.49996C9.83325 6.27894 9.74546 6.06698 9.58918 5.9107C9.4329 5.75442 9.22093 5.66663 8.99992 5.66663C8.77891 5.66663 8.56695 5.75442 8.41067 5.9107C8.25439 6.06698 8.16659 6.27894 8.16659 6.49996V9.15352C7.68054 9.32472 7.25939 9.64218 6.96098 10.0623C6.66256 10.4824 6.50151 10.9846 6.49992 11.5H2.83334L2.82474 11.5017C2.60799 10.9669 2.46221 10.406 2.39114 9.83329H3.16659C3.3876 9.83329 3.59956 9.74549 3.75584 9.58921C3.91212 9.43293 3.99992 9.22097 3.99992 8.99996C3.99992 8.77894 3.91212 8.56698 3.75584 8.4107C3.59956 8.25442 3.3876 8.16663 3.16659 8.16663H2.39114C2.54005 6.9821 3.00621 5.85981 3.74037 4.91838L4.28597 5.46399C4.36335 5.54137 4.4552 5.60274 4.5563 5.64462C4.65739 5.68649 4.76574 5.70804 4.87517 5.70804C4.98459 5.70804 5.09294 5.68649 5.19404 5.64461C5.29513 5.60274 5.38699 5.54136 5.46436 5.46399C5.54173 5.38661 5.60311 5.29476 5.64498 5.19366C5.68686 5.09257 5.70841 4.98422 5.70841 4.87479C5.70841 4.76537 5.68686 4.65702 5.64498 4.55592C5.60311 4.45483 5.54173 4.36297 5.46435 4.2856L4.91881 3.74005C5.86016 3.00613 6.98227 2.5401 8.16659 2.39118V3.16663C8.16659 3.38764 8.25439 3.5996 8.41067 3.75588C8.56695 3.91216 8.77891 3.99996 8.99992 3.99996C9.22093 3.99996 9.4329 3.91216 9.58918 3.75588C9.74546 3.5996 9.83325 3.38764 9.83325 3.16663V2.39118C11.0176 2.5401 12.1397 3.00613 13.081 3.74005L12.5355 4.2856C12.3792 4.44186 12.2914 4.6538 12.2914 4.87479C12.2914 5.09578 12.3792 5.30772 12.5355 5.46399C12.6917 5.62025 12.9037 5.70804 13.1247 5.70804C13.3457 5.70804 13.5576 5.62026 13.7139 5.46399L14.2595 4.91838C14.9936 5.85981 15.4598 6.9821 15.6087 8.16663H14.8333C14.6122 8.16663 14.4003 8.25442 14.244 8.4107C14.0877 8.56698 13.9999 8.77894 13.9999 8.99996C13.9999 9.22097 14.0877 9.43293 14.244 9.58921C14.4003 9.74549 14.6122 9.83329 14.8333 9.83329H15.6087C15.5376 10.406 15.3919 10.9669 15.1751 11.5017Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                      <span>Dashboard</span>
                      <span class="inline-block ml-auto">
                        <svg
                          class="text-gray-400 w-3 h-3"
                          viewbox="0 0 10 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.08329 0.666626C8.74996 0.333293 8.24996 0.333293 7.91663 0.666626L4.99996 3.58329L2.08329 0.666626C1.74996 0.333293 1.24996 0.333293 0.916626 0.666626C0.583293 0.999959 0.583293 1.49996 0.916626 1.83329L4.41663 5.33329C4.58329 5.49996 4.74996 5.58329 4.99996 5.58329C5.24996 5.58329 5.41663 5.49996 5.58329 5.33329L9.08329 1.83329C9.41663 1.49996 9.41663 0.999959 9.08329 0.666626Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 rounded"
                      href="../admin/email"
                    >
                      <span class="inline-block mr-3">
                        <svg
                          class="text-gray-600 w-5 h-5"
                          viewbox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.8802 1.66663H4.2135C3.55068 1.66735 2.91522 1.93097 2.44653 2.39966C1.97785 2.86834 1.71422 3.50381 1.7135 4.16663V15.8333C1.71422 16.4961 1.97785 17.1316 2.44653 17.6003C2.91522 18.0689 3.55068 18.3326 4.2135 18.3333H15.8802C16.543 18.3326 17.1785 18.0689 17.6471 17.6003C18.1158 17.1316 18.3794 16.4961 18.3802 15.8333V4.16663C18.3794 3.50381 18.1158 2.86834 17.6471 2.39966C17.1785 1.93097 16.543 1.66735 15.8802 1.66663ZM4.2135 3.33329H15.8802C16.1011 3.33351 16.3129 3.42138 16.4692 3.57761C16.6254 3.73385 16.7133 3.94568 16.7135 4.16663V10.8333H14.6595C14.385 10.8331 14.1148 10.9007 13.8729 11.0302C13.6309 11.1597 13.4248 11.347 13.2728 11.5755L12.1009 13.3333H7.9928L6.82093 11.5755C6.6689 11.347 6.46273 11.1597 6.22079 11.0302C5.97884 10.9007 5.70863 10.8331 5.43421 10.8333H3.38017V4.16663C3.38039 3.94568 3.46826 3.73385 3.62449 3.57761C3.78072 3.42138 3.99255 3.33351 4.2135 3.33329ZM15.8802 16.6666H4.2135C3.99255 16.6664 3.78072 16.5785 3.62449 16.4223C3.46826 16.2661 3.38039 16.0542 3.38017 15.8333V12.5H5.43421L6.60608 14.2578C6.75811 14.4862 6.96428 14.6736 7.20622 14.803C7.44817 14.9325 7.71838 15.0002 7.9928 15H12.1009C12.3753 15.0002 12.6455 14.9325 12.8875 14.803C13.1294 14.6736 13.3356 14.4862 13.4876 14.2578L14.6595 12.5H16.7135V15.8333C16.7133 16.0542 16.6254 16.2661 16.4692 16.4223C16.3129 16.5785 16.1011 16.6664 15.8802 16.6666Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                      <span>Inbox</span>
                      <span class="flex justify-center items-center ml-auto bg-red-500 w-6 h-6 text-xs rounded-full">
                        4
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 rounded"
                      href="../admin/medewerkerlijst"
                    >
                      <span class="inline-block mr-3">
                        <svg
                          class="text-gray-600 w-5 h-5"
                          viewbox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.3414 9.23329C11.8689 8.66683 12.166 7.92394 12.1747 7.14996C12.1747 6.31453 11.8428 5.51331 11.2521 4.92257C10.6614 4.33183 9.86015 3.99996 9.02472 3.99996C8.18928 3.99996 7.38807 4.33183 6.79733 4.92257C6.20659 5.51331 5.87472 6.31453 5.87472 7.14996C5.88341 7.92394 6.18057 8.66683 6.70805 9.23329C5.97359 9.59902 5.34157 10.1416 4.86881 10.8122C4.39606 11.4827 4.0974 12.2603 3.99972 13.075C3.9754 13.296 4.03989 13.5176 4.17897 13.6911C4.31806 13.8645 4.52037 13.9756 4.74138 14C4.9624 14.0243 5.18401 13.9598 5.35749 13.8207C5.53096 13.6816 5.64207 13.4793 5.66638 13.2583C5.76583 12.4509 6.15709 11.7078 6.76645 11.1688C7.37582 10.6299 8.16123 10.3324 8.97472 10.3324C9.7882 10.3324 10.5736 10.6299 11.183 11.1688C11.7923 11.7078 12.1836 12.4509 12.283 13.2583C12.3062 13.472 12.4111 13.6684 12.5757 13.8066C12.7403 13.9448 12.9519 14.0141 13.1664 14H13.258C13.4765 13.9748 13.6762 13.8644 13.8135 13.6927C13.9509 13.521 14.0148 13.3019 13.9914 13.0833C13.9009 12.2729 13.6117 11.4975 13.1494 10.8258C12.6871 10.1542 12.066 9.60713 11.3414 9.23329ZM8.99972 8.63329C8.70634 8.63329 8.41955 8.5463 8.17562 8.38331C7.93169 8.22031 7.74156 7.98865 7.62929 7.71761C7.51702 7.44656 7.48765 7.14831 7.54488 6.86058C7.60212 6.57284 7.74339 6.30853 7.95084 6.10108C8.15829 5.89364 8.42259 5.75236 8.71033 5.69513C8.99807 5.63789 9.29632 5.66727 9.56736 5.77954C9.83841 5.89181 10.0701 6.08193 10.2331 6.32586C10.3961 6.5698 10.483 6.85658 10.483 7.14996C10.483 7.54336 10.3268 7.92066 10.0486 8.19883C9.77041 8.47701 9.39312 8.63329 8.99972 8.63329ZM14.833 0.666626H3.16638C2.50334 0.666626 1.86746 0.930018 1.39862 1.39886C0.929774 1.8677 0.666382 2.50358 0.666382 3.16663V14.8333C0.666382 15.4963 0.929774 16.1322 1.39862 16.6011C1.86746 17.0699 2.50334 17.3333 3.16638 17.3333H14.833C15.4961 17.3333 16.132 17.0699 16.6008 16.6011C17.0697 16.1322 17.333 15.4963 17.333 14.8333V3.16663C17.333 2.50358 17.0697 1.8677 16.6008 1.39886C16.132 0.930018 15.4961 0.666626 14.833 0.666626ZM15.6664 14.8333C15.6664 15.0543 15.5786 15.2663 15.4223 15.4225C15.266 15.5788 15.0541 15.6666 14.833 15.6666H3.16638C2.94537 15.6666 2.73341 15.5788 2.57713 15.4225C2.42085 15.2663 2.33305 15.0543 2.33305 14.8333V3.16663C2.33305 2.94561 2.42085 2.73365 2.57713 2.57737C2.73341 2.42109 2.94537 2.33329 3.16638 2.33329H14.833C15.0541 2.33329 15.266 2.42109 15.4223 2.57737C15.5786 2.73365 15.6664 2.94561 15.6664 3.16663V14.8333Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                      <span>Users</span>
                      <span class="inline-block ml-auto">
                        <svg
                          class="text-gray-400 w-3 h-3"
                          viewbox="0 0 10 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.08329 0.666626C8.74996 0.333293 8.24996 0.333293 7.91663 0.666626L4.99996 3.58329L2.08329 0.666626C1.74996 0.333293 1.24996 0.333293 0.916626 0.666626C0.583293 0.999959 0.583293 1.49996 0.916626 1.83329L4.41663 5.33329C4.58329 5.49996 4.74996 5.58329 4.99996 5.58329C5.24996 5.58329 5.41663 5.49996 5.58329 5.33329L9.08329 1.83329C9.41663 1.49996 9.41663 0.999959 9.08329 0.666626Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </span>
                    </a>
                  </li>
                </ul>
                <div class="pt-8">
                  <a
                    class="flex items-center pl-3 py-3 pr-2 text-gray-50 hover:bg-gray-900 rounded"
                    href="/"
                  >
                    <span class="inline-block mr-4">
                      <svg
                        class="text-gray-600 w-5 h-5"
                        viewbox="0 0 14 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.333618 8.99996C0.333618 9.22097 0.421416 9.43293 0.577696 9.58922C0.733976 9.7455 0.945938 9.83329 1.16695 9.83329H7.49195L5.57528 11.7416C5.49718 11.8191 5.43518 11.9113 5.39287 12.0128C5.35057 12.1144 5.32879 12.2233 5.32879 12.3333C5.32879 12.4433 5.35057 12.5522 5.39287 12.6538C5.43518 12.7553 5.49718 12.8475 5.57528 12.925C5.65275 13.0031 5.74492 13.0651 5.84647 13.1074C5.94802 13.1497 6.05694 13.1715 6.16695 13.1715C6.27696 13.1715 6.38588 13.1497 6.48743 13.1074C6.58898 13.0651 6.68115 13.0031 6.75862 12.925L10.0919 9.59163C10.1678 9.51237 10.2273 9.41892 10.2669 9.31663C10.3503 9.11374 10.3503 8.88618 10.2669 8.68329C10.2273 8.581 10.1678 8.48755 10.0919 8.40829L6.75862 5.07496C6.68092 4.99726 6.58868 4.93563 6.48716 4.89358C6.38564 4.85153 6.27683 4.82988 6.16695 4.82988C6.05707 4.82988 5.94826 4.85153 5.84674 4.89358C5.74522 4.93563 5.65298 4.99726 5.57528 5.07496C5.49759 5.15266 5.43595 5.2449 5.3939 5.34642C5.35185 5.44794 5.33021 5.55674 5.33021 5.66663C5.33021 5.77651 5.35185 5.88532 5.3939 5.98683C5.43595 6.08835 5.49759 6.18059 5.57528 6.25829L7.49195 8.16663H1.16695C0.945938 8.16663 0.733976 8.25442 0.577696 8.4107C0.421416 8.56698 0.333618 8.77895 0.333618 8.99996ZM11.1669 0.666626H2.83362C2.17058 0.666626 1.53469 0.930018 1.06585 1.39886C0.59701 1.8677 0.333618 2.50358 0.333618 3.16663V5.66663C0.333618 5.88764 0.421416 6.0996 0.577696 6.25588C0.733976 6.41216 0.945938 6.49996 1.16695 6.49996C1.38797 6.49996 1.59993 6.41216 1.75621 6.25588C1.91249 6.0996 2.00028 5.88764 2.00028 5.66663V3.16663C2.00028 2.94561 2.08808 2.73365 2.24436 2.57737C2.40064 2.42109 2.6126 2.33329 2.83362 2.33329H11.1669C11.388 2.33329 11.5999 2.42109 11.7562 2.57737C11.9125 2.73365 12.0003 2.94561 12.0003 3.16663V14.8333C12.0003 15.0543 11.9125 15.2663 11.7562 15.4225C11.5999 15.5788 11.388 15.6666 11.1669 15.6666H2.83362C2.6126 15.6666 2.40064 15.5788 2.24436 15.4225C2.08808 15.2663 2.00028 15.0543 2.00028 14.8333V12.3333C2.00028 12.1123 1.91249 11.9003 1.75621 11.744C1.59993 11.5878 1.38797 11.5 1.16695 11.5C0.945938 11.5 0.733976 11.5878 0.577696 11.744C0.421416 11.9003 0.333618 12.1123 0.333618 12.3333V14.8333C0.333618 15.4963 0.59701 16.1322 1.06585 16.6011C1.53469 17.0699 2.17058 17.3333 2.83362 17.3333H11.1669C11.83 17.3333 12.4659 17.0699 12.9347 16.6011C13.4036 16.1322 13.6669 15.4963 13.6669 14.8333V3.16663C13.6669 2.50358 13.4036 1.8677 12.9347 1.39886C12.4659 0.930018 11.83 0.666626 11.1669 0.666626Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <span>Log Out</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
          <div class="mx-auto lg:ml-80">
            <section class="py-8 px-6">
              <div class="flex flex-wrap -mx-3 items-center">
                <div class="w-full lg:w-1/2 flex items-center mb-5 lg:mb-0 px-3">
                  <span class="inline-flex justify-center items-center w-16 h-16 mr-4 rounded">
                    <img
                      className="mx-auto h-12 w-auto pl-3"
                      src={require("../../assets/logo.png")}
                      alt="Workflow"
                    />
                  </span>
                  <div>
                    <h2 class="mb-1 text-2xl font-bold">Hours Overview</h2>
                  </div>
                </div>
              </div>
            </section>
            <div className="container px-4 mx-auto">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Monthly/yearly Overview
              </label>
              <select
                id="location"
                onChange={(e) => setPeriodeMaand(e.target.value)}
                name="location"
                className="mt-1 block w-2/12 pl-3 py-2  text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md "
                defaultValue="Period"
              >
                <option disabled>Period</option>
                <option value={"month"}>Month</option>
                <option value={"year"}>Year</option>
              </select>

              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Employee
              </label>
              <select
                onChange={(e) => setMedewerker(e.target.value)}
                value={medewerker}
                id="location"
                name="location"
                className="mt-1 block w-2/12 pl-3 py-2  text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md "
                defaultValue="Employee"
              >
                <option disabled>Employee</option>
                {medewerkers.map((medewerker) => (
                  <option value={medewerker?.id}>
                    {medewerker.first_name} {medewerker.last_name}
                  </option>
                ))}
              </select>
            </div>

            <section class="py-8">
              <div class="container px-4 mx-auto">
                <div class="p-4 mb-6 bg-white shadow rounded">
                  <table class="table-auto w-full">
                    <thead>
                      <tr class="text-xs text-gray-500 text-left">
                        <th class="pb-3 font-medium">Employee</th>
                        <th class="pl-6 pb-3 font-medium">Date</th>
                        <th class="pb-3 font-medium">Start</th>
                        <th class="pb-3 font-medium">End</th>
                        <th class="pb-3 font-medium">Break</th>
                        <th class="pb-3 font-medium">Total Hours</th>
                        <th class="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uren.map((uur) => (
                        <tr class="text-xs bg-gray-50">
                          <td class="flex px-4 py-3">
                            <div>
                              <p class="font-medium">
                                {uur.first_name} {uur.last_name}
                              </p>
                            </div>
                          </td>
                          <td class="py-5 px-6 font-medium">
                            {new Date(uur.start_date).toLocaleDateString()}
                          </td>

                          <td class="font-medium">
                            {uur.start_hour}
                            {}
                          </td>

                          <td class="font-medium">{uur.end_hour}</td>

                          <td class="font-medium">{uur.break_hour}</td>

                          <td class="font-medium">
                            {totalHourCalc(
                              uur.end_hour,
                              uur.start_hour,
                              uur.break_hour
                            )}
                          </td>

                          <td>
                            <button // edit button
                              class="inline-block"
                              onClick={() => {
                                setOpenUpdate(true);
                                setClickedHour(uur.id);
                              }}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16.4999 9C16.2789 9 16.0669 9.0878 15.9106 9.24408C15.7544 9.40036 15.6666 9.61232 15.6666 9.83333V14.8333C15.6666 15.0543 15.5788 15.2663 15.4225 15.4226C15.2662 15.5789 15.0542 15.6667 14.8332 15.6667H3.16656C2.94555 15.6667 2.73359 15.5789 2.57731 15.4226C2.42103 15.2663 2.33323 15.0543 2.33323 14.8333V3.16667C2.33323 2.94565 2.42103 2.73369 2.57731 2.57741C2.73359 2.42113 2.94555 2.33333 3.16656 2.33333H8.16657C8.38758 2.33333 8.59954 2.24554 8.75582 2.08926C8.9121 1.93298 8.9999 1.72101 8.9999 1.5C8.9999 1.27899 8.9121 1.06702 8.75582 0.910744C8.59954 0.754464 8.38758 0.666667 8.16657 0.666667H3.16656C2.50352 0.666667 1.86764 0.930059 1.3988 1.3989C0.929957 1.86774 0.666565 2.50363 0.666565 3.16667V14.8333C0.666565 15.4964 0.929957 16.1323 1.3988 16.6011C1.86764 17.0699 2.50352 17.3333 3.16656 17.3333H14.8332C15.4963 17.3333 16.1322 17.0699 16.601 16.6011C17.0698 16.1323 17.3332 15.4964 17.3332 14.8333V9.83333C17.3332 9.61232 17.2454 9.40036 17.0892 9.24408C16.9329 9.0878 16.7209 9 16.4999 9ZM3.9999 9.63333V13.1667C3.9999 13.3877 4.0877 13.5996 4.24398 13.7559C4.40026 13.9122 4.61222 14 4.83323 14H8.36657C8.47624 14.0006 8.58496 13.9796 8.68649 13.9381C8.78802 13.8967 8.88037 13.8356 8.95823 13.7583L14.7249 7.98333L17.0916 5.66667C17.1697 5.5892 17.2317 5.49703 17.274 5.39548C17.3163 5.29393 17.3381 5.18501 17.3381 5.075C17.3381 4.96499 17.3163 4.85607 17.274 4.75452C17.2317 4.65297 17.1697 4.5608 17.0916 4.48333L13.5582 0.908333C13.4808 0.830226 13.3886 0.768231 13.287 0.725924C13.1855 0.683617 13.0766 0.661835 12.9666 0.661835C12.8566 0.661835 12.7476 0.683617 12.6461 0.725924C12.5445 0.768231 12.4524 0.830226 12.3749 0.908333L10.0249 3.26667L4.24156 9.04167C4.16433 9.11953 4.10323 9.21188 4.06176 9.31341C4.02029 9.41494 3.99926 9.52366 3.9999 9.63333ZM12.9666 2.675L15.3249 5.03333L14.1416 6.21667L11.7832 3.85833L12.9666 2.675ZM5.66656 9.975L10.6082 5.03333L12.9666 7.39167L8.0249 12.3333H5.66656V9.975Z"
                                  fill="#382CDD"
                                ></path>
                              </svg>
                            </button>
                            <button // remove button
                              class="inline-block"
                              onClick={() => {
                                setOpen(true);
                                setClickedHour(uur.id);
                              }}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.33333 15C8.55435 15 8.76631 14.9122 8.92259 14.7559C9.07887 14.5996 9.16667 14.3877 9.16667 14.1667V9.16666C9.16667 8.94564 9.07887 8.73368 8.92259 8.5774C8.76631 8.42112 8.55435 8.33332 8.33333 8.33332C8.11232 8.33332 7.90036 8.42112 7.74408 8.5774C7.5878 8.73368 7.5 8.94564 7.5 9.16666V14.1667C7.5 14.3877 7.5878 14.5996 7.74408 14.7559C7.90036 14.9122 8.11232 15 8.33333 15ZM16.6667 4.99999H13.3333V4.16666C13.3333 3.50362 13.0699 2.86773 12.6011 2.39889C12.1323 1.93005 11.4964 1.66666 10.8333 1.66666H9.16667C8.50363 1.66666 7.86774 1.93005 7.3989 2.39889C6.93006 2.86773 6.66667 3.50362 6.66667 4.16666V4.99999H3.33333C3.11232 4.99999 2.90036 5.08779 2.74408 5.24407C2.5878 5.40035 2.5 5.61231 2.5 5.83332C2.5 6.05434 2.5878 6.2663 2.74408 6.42258C2.90036 6.57886 3.11232 6.66666 3.33333 6.66666H4.16667V15.8333C4.16667 16.4964 4.43006 17.1322 4.8989 17.6011C5.36774 18.0699 6.00363 18.3333 6.66667 18.3333H13.3333C13.9964 18.3333 14.6323 18.0699 15.1011 17.6011C15.5699 17.1322 15.8333 16.4964 15.8333 15.8333V6.66666H16.6667C16.8877 6.66666 17.0996 6.57886 17.2559 6.42258C17.4122 6.2663 17.5 6.05434 17.5 5.83332C17.5 5.61231 17.4122 5.40035 17.2559 5.24407C17.0996 5.08779 16.8877 4.99999 16.6667 4.99999ZM8.33333 4.16666C8.33333 3.94564 8.42113 3.73368 8.57741 3.5774C8.73369 3.42112 8.94565 3.33332 9.16667 3.33332H10.8333C11.0543 3.33332 11.2663 3.42112 11.4226 3.5774C11.5789 3.73368 11.6667 3.94564 11.6667 4.16666V4.99999H8.33333V4.16666ZM14.1667 15.8333C14.1667 16.0543 14.0789 16.2663 13.9226 16.4226C13.7663 16.5789 13.5543 16.6667 13.3333 16.6667H6.66667C6.44565 16.6667 6.23369 16.5789 6.07741 16.4226C5.92113 16.2663 5.83333 16.0543 5.83333 15.8333V6.66666H14.1667V15.8333ZM11.6667 15C11.8877 15 12.0996 14.9122 12.2559 14.7559C12.4122 14.5996 12.5 14.3877 12.5 14.1667V9.16666C12.5 8.94564 12.4122 8.73368 12.2559 8.5774C12.0996 8.42112 11.8877 8.33332 11.6667 8.33332C11.4457 8.33332 11.2337 8.42112 11.0774 8.5774C10.9211 8.73368 10.8333 8.94564 10.8333 9.16666V14.1667C10.8333 14.3877 10.9211 14.5996 11.0774 14.7559C11.2337 14.9122 11.4457 15 11.6667 15Z"
                                  fill="#E85444"
                                ></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Transition.Root show={openUpdate} as={Fragment}>
                  <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    onClose={setOpenUpdate}
                  >
                    <div className=" flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                      </Transition.Child>

                      {/* This element is to trick the browser into centering the modal contents. */}
                      <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                      >
                        &#8203;
                      </span>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      >
                        <div
                          /* Update Venster */ className="inline-block bg-white rounded-lg pb-24 px-20 pt-10 text-center overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle  "
                        >
                          <div className="">
                            <div className="">
                              <Dialog.Title
                                as="h3"
                                className="text-lg leading-6 font-medium text-gray-900"
                              >
                                Update Hours
                              </Dialog.Title>
                              <div className="mt-2"></div>
                            </div>
                          </div>
                          <div
                            className="" /* <<<<<<<<<UPDATE MODAL>>>>>>>>>> */
                          >
                            <div className="">
                              <p className="text-xs p-1"> Date </p>
                              <label htmlFor="date" className="sr-only">
                                Date
                              </label>
                              <DatePicker
                                placeholderText="Select Date"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-center"
                                selected={beginDate}
                                onChange={(start_date) => {
                                  setBeginDate(start_date);
                                  return start_date;
                                }}
                              />

                              <p className="text-xs p-1"> Start Time </p>
                              <label htmlFor="start" className="sr-only">
                                Start Time
                              </label>
                              <input
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-center"
                                type="text"
                                placeholder="Start Hh,mm"
                                style={{ marginRight: "10px" }}
                                onChange={(e) => {
                                  setBeginUren(e.target.value);
                                }}
                              ></input>

                              <p className="text-xs p-1"> End Time </p>
                              <label htmlFor="start" className="sr-only">
                                End Time
                              </label>
                              <input
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-center"
                                type="text"
                                placeholder="End Hh,mm"
                                style={{ marginRight: "10px" }}
                                onChange={(e) => {
                                  setEndUren(e.target.value);
                                }}
                              ></input>

                              <p className="text-xs p-1"> Break </p>
                              <label htmlFor="start" className="sr-only">
                                Break
                              </label>
                              <input
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-center"
                                type="text"
                                placeholder="Break Hh,mm"
                                style={{ marginRight: "10px" }}
                                onChange={(e) => {
                                  setBreakUren(e.target.value);
                                }}
                              ></input>
                            </div>
                          </div>
                          <div className="pt-6">
                            <button
                              type="button"
                              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                              onClick={() => onUpdate()}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              onClick={() => setOpenUpdate(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition.Root>

                <Transition.Root show={open} as={Fragment}>
                  <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    onClose={setOpen}
                  >
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                      </Transition.Child>

                      {/* This element is to trick the browser into centering the modal contents. */}
                      <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                      >
                        &#8203;
                      </span>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      >
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                          <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <Dialog.Title
                                as="h3"
                                className="text-lg leading-6 font-medium text-gray-900"
                              >
                                Delete Hours
                              </Dialog.Title>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to delete these
                                  specified hours? This action cannot be undone.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex">
                            <button
                              type="button"
                              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                              onClick={() => onDelete()}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              onClick={() => setOpen(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition.Root>
                <div class="flex flex-wrap -mx-4 items-center justify-between">
                  <div class="w-full lg:w-1/3 px-4 flex items-center mb-4 lg:mb-0">
                    <p class="text-xs text-gray-400">Show</p>
                    <div class="mx-3 py-2 px-2 text-xs text-gray-500 bg-white border rounded">
                      <select name="" id="">
                        <option value="1">15</option>
                        <option value="1">25</option>
                        <option value="1">50</option>
                        <option value="1">100</option>
                      </select>
                    </div>
                    <p class="text-xs text-gray-400">of 1200</p>
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total worked hours: {monthlyWorkedHours(uren)}
                    </label>
                  </div>
                  <div class="w-full lg:w-auto px-4 flex items-center justify-center">
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs text-gray-500 border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      <svg
                        width="6"
                        height="8"
                        viewBox="0 0 6 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.53335 3.99999L4.86668 1.66666C5.13335 1.39999 5.13335 0.999992 4.86668 0.733325C4.60002 0.466659 4.20002 0.466659 3.93335 0.733325L1.13335 3.53333C0.866683 3.79999 0.866683 4.19999 1.13335 4.46666L3.93335 7.26666C4.06668 7.39999 4.20002 7.46666 4.40002 7.46666C4.60002 7.46666 4.73335 7.39999 4.86668 7.26666C5.13335 6.99999 5.13335 6.59999 4.86668 6.33333L2.53335 3.99999Z"
                          fill="#A4AFBB"
                        ></path>
                      </svg>
                    </a>
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs text-gray-500 border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      1
                    </a>
                    <span class="inline-block mr-3">
                      <svg
                        class="h-3 w-3 text-gray-200"
                        viewBox="0 0 12 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 0.666687C5.26667 0.666687 4.66667 1.26669 4.66667 2.00002C4.66667 2.73335 5.26667 3.33335 6 3.33335C6.73333 3.33335 7.33333 2.73335 7.33333 2.00002C7.33333 1.26669 6.73333 0.666687 6 0.666687ZM1.33333 0.666687C0.6 0.666687 0 1.26669 0 2.00002C0 2.73335 0.6 3.33335 1.33333 3.33335C2.06667 3.33335 2.66667 2.73335 2.66667 2.00002C2.66667 1.26669 2.06667 0.666687 1.33333 0.666687ZM10.6667 0.666687C9.93333 0.666687 9.33333 1.26669 9.33333 2.00002C9.33333 2.73335 9.93333 3.33335 10.6667 3.33335C11.4 3.33335 12 2.73335 12 2.00002C12 1.26669 11.4 0.666687 10.6667 0.666687Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs text-white bg-indigo-500 rounded"
                      href="#"
                    >
                      12
                    </a>
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs text-gray-500 border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      13
                    </a>
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs text-gray-500 border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      14
                    </a>
                    <span class="inline-block mr-3">
                      <svg
                        class="h-3 w-3 text-gray-200"
                        viewBox="0 0 12 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 0.666687C5.26667 0.666687 4.66667 1.26669 4.66667 2.00002C4.66667 2.73335 5.26667 3.33335 6 3.33335C6.73333 3.33335 7.33333 2.73335 7.33333 2.00002C7.33333 1.26669 6.73333 0.666687 6 0.666687ZM1.33333 0.666687C0.6 0.666687 0 1.26669 0 2.00002C0 2.73335 0.6 3.33335 1.33333 3.33335C2.06667 3.33335 2.66667 2.73335 2.66667 2.00002C2.66667 1.26669 2.06667 0.666687 1.33333 0.666687ZM10.6667 0.666687C9.93333 0.666687 9.33333 1.26669 9.33333 2.00002C9.33333 2.73335 9.93333 3.33335 10.6667 3.33335C11.4 3.33335 12 2.73335 12 2.00002C12 1.26669 11.4 0.666687 10.6667 0.666687Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                    <a
                      class="inline-flex mr-3 items-center justify-center w-8 h-8 text-xs border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      62
                    </a>
                    <a
                      class="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-500 border border-gray-300 bg-white hover:bg-indigo-50 rounded"
                      href="#"
                    >
                      <svg
                        width="6"
                        height="8"
                        viewBox="0 0 6 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.88663 3.52667L2.05996 0.700006C1.99799 0.637521 1.92425 0.587925 1.84301 0.554079C1.76177 0.520233 1.67464 0.502808 1.58663 0.502808C1.49862 0.502808 1.41148 0.520233 1.33024 0.554079C1.249 0.587925 1.17527 0.637521 1.1133 0.700006C0.989128 0.824915 0.919434 0.993883 0.919434 1.17001C0.919434 1.34613 0.989128 1.5151 1.1133 1.64001L3.4733 4.00001L1.1133 6.36001C0.989128 6.48491 0.919434 6.65388 0.919434 6.83001C0.919434 7.00613 0.989128 7.1751 1.1133 7.30001C1.17559 7.36179 1.24947 7.41068 1.33069 7.44385C1.41192 7.47703 1.49889 7.49385 1.58663 7.49334C1.67437 7.49385 1.76134 7.47703 1.84257 7.44385C1.92379 7.41068 1.99767 7.36179 2.05996 7.30001L4.88663 4.47334C4.94911 4.41136 4.99871 4.33763 5.03256 4.25639C5.0664 4.17515 5.08383 4.08801 5.08383 4.00001C5.08383 3.912 5.0664 3.82486 5.03256 3.74362C4.99871 3.66238 4.94911 3.58865 4.88663 3.52667Z"
                          fill="#A4AFBB"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </body>
  );
}
