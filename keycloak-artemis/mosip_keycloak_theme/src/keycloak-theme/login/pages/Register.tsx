// ejected using 'npx eject-keycloak-page'
import { useState, useEffect, useRef } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import Recaptcha from 'react-recaptcha';
import arrow from '../assets/expand_more_FILL0_wght300_GRAD0_opsz24 (1).svg';
import eyeIcon from '../assets/visibility_FILL0_wght400_GRAD0_opsz48.svg';
import eyeIconOff from '../assets/visibility_off.svg';
import info from '../assets/info.svg';
import error from '../assets/error.svg';
import ToolTip from "./shared/Tooltip";
import arrowRight from "../assets/arrow_right_rtl.svg";
import closeIcon from '../assets/close_icon.svg';

declare global {
    interface Window {
        grecaptcha: {
            render: (
                container?: string | HTMLElement,
                options?: {
                    sitekey: string;
                    theme?: string;
                    size?: string;
                    tabindex?: number;
                    callback?: (response: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                }
            ) => number;
        };
    }
}

export default function Register(props: PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { url, messagesPerField, register, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey, message, locale } = kcContext;
    const { msg, msgStr } = i18n;

    const pattern = new RegExp(register?.attributesByName?.email?.validators?.pattern?.pattern);
    const phonePattern = new RegExp(register?.attributesByName?.phoneNumber?.validators?.pattern?.pattern);
    const userNamePattern = new RegExp(register?.attributesByName?.username?.validators?.pattern?.pattern);
    const userNameMax = Number(register?.attributesByName?.username?.validators.length?.max);
    const userNameMin = Number(register?.attributesByName?.username?.validators.length?.min);
    const emailMax = Number(register?.attributesByName?.email?.validators.length?.max);
    const phoneNoMax = Number(register?.attributesByName?.phoneNumber?.validators.length?.max);
    const orgNameMax = Number(register?.attributesByName?.orgName?.validators.length?.max);
    const addressMax = Number(register?.attributesByName?.address?.validators.length?.max);

    const organisationData = JSON.parse(msgStr("organization"));
    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');
    const [orgDropdown, showOrgDropdown] = useState(false);
    const [dummyFormData, addFormDataValue] = useState(register.formData);
    const [invalidEmail, checkInvalidEmail] = useState(false);
    const [invalidPhoneNo, checkInvalidPhoneNo] = useState(false);
    const [invalidUserName, checkInvalidUserName] = useState(false);
    const [confPasswordMatch, checkConfPasswordMatch] = useState(false);
    const [orgData, setFilterOrgData] = useState(organisationData);
    const [isReloadBtn, setReloadBtn] = useState(false);
    const [minLength, checkminLength] = useState(false);
    const [invalidFirstName, checkInvalidFirstName] = useState(false);
    const [invalidLastName, checkInvalidLastName] = useState(false);
    const [errorMessage, setErrorMsg] = useState({ ...message });
    const [openErrTab, getOpenErrTab] = useState(true);
    const [invalidOrgValue, checkInvalidOrgVal] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    

    useEffect(() => {
        if (recaptchaRequired && recaptchaSiteKey) {
            const recaptchaScriptUrl = kcContext.scripts?.[0] || "https://www.google.com/recaptcha/api.js"; // fallback for Storybook

            let script = document.querySelector(`script[src="${recaptchaScriptUrl}"]`) as HTMLScriptElement | null;

            const renderRecaptcha = () => {
                if (window.grecaptcha && document.getElementById("recaptcha-container")) {
                    window.grecaptcha.render("recaptcha-container", {
                        sitekey: recaptchaSiteKey
                        // other reCAPTCHA options as needed
                    });
                }
            };

            if (!script) {
                script = document.createElement("script");
                script.src = recaptchaScriptUrl;
                script.async = true;
                document.head.appendChild(script);

                script.onload = () => {
                    setTimeout(renderRecaptcha, 500);
                };
            } else {
                setTimeout(renderRecaptcha, 500);
            }

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script!);
                }
            };
        }

       

    }, [recaptchaRequired, recaptchaSiteKey, kcContext.scripts]);

    const selectedPartnerTypeValue = (e: any) => {
        addFormDataValue(prevState => ({
            ...prevState,
            partnerType: e.target.value
        }))
    }

    const showPassword = (fieldType: string) => {
        if (fieldType === 'password') {
            passwordType === 'password' ? setPasswordType('text') : setPasswordType('password')
        } else {
            confPasswordType === 'password' ? setConfPasswordType('text') : setConfPasswordType('password')
        }
    }

    const selectOrgName = (val: any) => {
        addFormDataValue(prevState => ({
            ...prevState,
            orgName: val
        }));
        showOrgDropdown(false);
    }

    const handleFormData = (event: any) => {
        const { name, value } = event.target;
        const finalValue = value.trimStart();
 
        if (name === 'email' && finalValue) {
            checkInvalidEmail(!pattern.test(finalValue))
        }
        if (name === 'phoneNumber' && finalValue) {
            checkInvalidPhoneNo(!phonePattern.test(String(finalValue)))
        }

        if (name === 'username' && finalValue) {
            userNamePattern.test(finalValue) ? checkInvalidUserName(false) : checkInvalidUserName(true);
            finalValue.length < (userNameMin) ? checkminLength(true) : checkminLength(false);
        }

        if (name === 'firstName' && finalValue) {
            /^[A-Za-z\s]+$/.test(finalValue) ? checkInvalidFirstName(false) : checkInvalidFirstName(true)
        }

        if (name === 'lastName' && finalValue) {
            /^[A-Za-z\s]+$/.test(finalValue) ? checkInvalidLastName(false) : checkInvalidLastName(true);
        }

        if (name === 'orgName') {
            checkInvalidOrgVal(!/^[a-zA-Z0-9\- ]*$/.test(finalValue));
            if (organisationData && finalValue.length) {
                let newOrgData = organisationData.filter((item: any) => {
                    if (item.value.toLowerCase().includes(finalValue.toLowerCase()))
                        return item
                })
                setFilterOrgData(newOrgData)
            }
        }

        addFormDataValue(prevState => ({
            ...prevState,
            [name]: finalValue
        }))

        if (name === 'password-confirm' && dummyFormData.password) {
            if (value !== dummyFormData.password) {
                checkConfPasswordMatch(true)
            } else {
                checkConfPasswordMatch(false)
            }
        }
        if (name === 'password' && dummyFormData['password-confirm']) {
            if (value !== dummyFormData['password-confirm']) {
                checkConfPasswordMatch(true)
            } else {
                checkConfPasswordMatch(false)
            }
        }
    }

    const onlyNumbers = (event: any) => {
        if ((["e", "E"].includes(event.key) || !/^[+\d().-]+$/.test(event.key)) && event.key !== 'Backspace' && event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Tab") {
            event.preventDefault()
        }
    }

    window.addEventListener("click", (e) => {
        if (orgDropdown && !menuRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
            showOrgDropdown(false)
        }

         
    })

    window.onbeforeunload = function () {
        if (!isReloadBtn && !localStorage.getItem("isLocaleopen")) {
            return 'Do you want to leave this page?'
        }
    }

    if (errorMessage.summary) {
        delete dummyFormData.password;
        delete dummyFormData["password-confirm"];
        setErrorMsg({});
        addFormDataValue(prevData => ({
            ...prevData,
            'g-recaptcha-response': false
        }));
    };

    const getTabEvents = (e: any, method: any) => {
        if (e.key === 'Enter') {
            return method();
        }
    };

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={
            <>
                <div id="kc-form-options">
                    <div className={getClassName("kcFormOptionsWrapperClass")}>
                        <span>
                            <button tabIndex={-1} onClick={() => setReloadBtn(true)}> <a tabIndex={0} href={url.loginUrl} className="flex flex-row items-center text-hLinkColor font-bold text-2xl font-inter"> {locale?.currentLanguageTag === 'ar' ? <img alt="arrow" src={arrowRight} /> : <img alt="arrow" src={arrow} />}&nbsp;{msg("backToLogin")}</a></button>
                        </span>
                    </div>
                </div>
                <h2 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-inter mb-2">{msg("registerTitle")}</h2>
                <p className="text-pTextColor text-xl font-inter">{msg("regDesc")}</p>
                <span className="text-pTextColor mt-4 text-xl font-inter"> {msg("requiredFields")}</span>
            </>
        }>
            <form id="kc-register-form" className={getClassName("kcFormClass")} action={url.registrationAction} method="post">
                {(message !== undefined && openErrTab) && (
                    <div className='bg-errorBg min-h-11 p-2 text-center text-errorColor font-semibold mb-3 rounded-lg px-4'>
                        <img onClick={() => getOpenErrTab(!openErrTab)} className="h-4 w-4 float-right cursor-pointer" alt="" src={closeIcon} />
                        <span className="kc-feedback-text"
                            dangerouslySetInnerHTML={{
                                "__html": message.summary
                            }}
                        />
                    </div>
                )}
                <div className={clsx(getClassName("kcFormGroupClass"), messagesPerField.printIfExists("partnerType", getClassName("kcFormGroupErrorClass")))}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="partnerType" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>{msg("partnerType")}</label>
                    </div>
                    <div className={getClassName('kcInputWrapperClass')}>
                        <div tabIndex={0} className={`border border-solid h-14 rounded-lg flex justify-between items-center ${dummyFormData.partnerType === '' ? 'shadow-errorShadow border-[#C61818]' : 'border-bColor'}`}>
                            <div className="w-full h-[87%] cursor-pointer">
                                <select value={dummyFormData.partnerType ?? ''} onChange={(e) => selectedPartnerTypeValue(e)} id="partnerType" name="partnerType" className="w-full h-full font-inter cursor-pointer outline-none px-2">
                                    <option value="" disabled>{msgStr("selectAnOption")}</option>
                                    {JSON.parse(msgStr('partnerTypeData')).map((item: any) => {
                                        return (<option value={item.id} key={item.id} className="block py-3 px-5 cursor-pointer hover:bg-[#F4F8FF]">{item.value}</option>)
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("firstName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="firstName" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("firstName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="firstName"
                            className={(getClassName("kcInputClass"), ((dummyFormData.firstName === '' || invalidFirstName) ? 'shadow-errorShadow border border-[#C61818] border-solid outline-none h-14 rounded-lg w-full px-3 font-inter' : 'border border-bColor border-solid outline-none h-14 rounded-lg w-full px-3 font-inter'))}
                            name="firstName"
                            placeholder={msgStr("firstNamePH")}
                            onChange={handleFormData}
                            value={dummyFormData.firstName ?? ""}
                            autoComplete="off"
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold font-inter">
                            {dummyFormData.firstName === '' && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("firstName")}</span></span>}
                            {invalidFirstName && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg("invalidInput")}</span></span>}
                        </span>}
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("lastName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="lastName" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("lastName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="lastName"
                            className={(getClassName("kcInputClass"), ((dummyFormData.lastName === '' || invalidLastName) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3 font-inter' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3 font-inter'))}
                            name="lastName"
                            placeholder={msgStr("lastNamePH")}
                            onChange={handleFormData}
                            autoComplete="off"
                            value={dummyFormData.lastName ?? ""}
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold font-inter">
                            {dummyFormData.lastName === '' && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("lastName")}</span></span>}
                            {invalidLastName && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg("invalidInput")}</span></span>}
                        </span>}
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("orgName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="orgName" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("orgName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                    <input
                        type="text"
                        id="orgName"
                        className={(getClassName("kcInputClass"), `outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter ${dummyFormData.orgName === '' ? 'shadow-errorShadowTwo  border-[#C61818]' : 'border-bColor'}`)}
                        name="orgName"
                        placeholder={msgStr("orgnamePH")}
                        value={dummyFormData.orgName ?? ''}
                        autoComplete="off"
                        onChange={handleFormData}
                        onClick={() => showOrgDropdown(!orgDropdown)}
                        ref={inputRef}
                        maxLength={orgNameMax ? orgNameMax : 2048}
                    />
                    {(orgDropdown && orgData) &&
                        (<div ref={menuRef} className="absolute max-[490px]:w-[88%] max-[840px]:w-[91.5%] w-[93.5%] z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-bColor mt-[2px] font-inter" >
                            {(orgData?.length) ?
                                <ul className="py-[1px] text-xl text-[#031640] font-inter" role="none" >
                                    {orgData.map((item: any, index: any) => (
                                        <>
                                            <li tabIndex={0} key={item.id} id={'orgName' + index} onClick={() => selectOrgName(item.value)} onKeyDown={(e) => getTabEvents(e, () => selectOrgName(item.value))} className="block py-3 px-5 cursor-pointer hover:bg-[#F4F8FF]" role="menuitem">{item.value}</li>
                                            <hr className="mx-4 border-[#D8D8D8] last-of-type:hidden" />
                                        </>
                                    ))}
                                </ul> : (<p className="py-1 px-3 text-xl text-[#031640] font-semibold">{msg('nosearchData')}</p>)}
                        </div>)
                    }
                    <div className="border border-[#EDDCAF] border-t-0 rounded-b-lg p-3 -mt-2 bg-[#FFF7E5] font-inter">
                        <span className="text-[#8B6105] font-semibold">{msg('orgInfoMsg')}</span>
                    </div>
                    {dummyFormData.orgName === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-start font-inter"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("orgName")}</span></span>}
                    {invalidOrgValue && dummyFormData.orgName !== '' && <span className="text-[#C61818] mb-0 font-semibold flex items-start font-inter"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('invalidOrgVal')}</span></span>}
                    {(orgNameMax === dummyFormData.orgName?.length) && <span className="flex items-start text-[#8B6105] font-semibold">{msg('maxLengthErrMsg')}&nbsp;{orgNameMax}&nbsp;{msg('charactersText')}</span>}
                </div>
                </div>
                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("address", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="address" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("address")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="address"
                            className={(getClassName("kcInputClass"), `outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter ${dummyFormData.address === '' ? 'shadow-errorShadow border-[#C61818]' : ' border-bColor'}`)}
                            name="address"
                            placeholder={msgStr("addressPH")}
                            autoComplete="off"
                            onChange={handleFormData}
                            value={dummyFormData.address ?? ""}
                            maxLength={addressMax}
                        />
                        {dummyFormData.address === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-start font-inter"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("address")}</span></span>}
                        {(addressMax === dummyFormData.address?.length) && <span className="flex items-start text-[#8B6105] font-semibold">{msg('maxLengthErrMsg')}&nbsp;{addressMax}&nbsp;{msg('charactersText')}</span>}
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("email", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="email" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("email")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="email"
                            className={(getClassName("kcInputClass"), `outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter ${(dummyFormData.email === '' || invalidEmail) ? 'shadow-errorShadow border-[#C61818]' : ' border-bColor'}`)}
                            name="email"
                            placeholder={msgStr("emailPH")}
                            onChange={handleFormData}
                            value={dummyFormData.email ?? ""}
                            autoComplete="off"
                            maxLength={emailMax ? emailMax : 2048}
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold font-inter">
                            {/* {(errorSummary?.includes("Email already exists.") || errorSummary?.includes("Username already exists.")) && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msgStr('existingEmailErr')}</span>} */}
                            {(invalidEmail && dummyFormData.email !== '') && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;{msgStr('invalidEmailErr')}</span>}
                            {dummyFormData.email === '' && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} &nbsp;{msg("email")}</span>}
                            {(emailMax === dummyFormData.email?.length) && <span className="flex items-start text-[#8B6105] font-semibold">{msg('maxLengthErrMsg')}&nbsp;{emailMax}&nbsp;{msg('charactersText')}</span>}
                        </span>}
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("phoneNumber", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="phoneNumber" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-hTextColor')}>
                            {msg("phoneNumber")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="tel"
                            id="phoneNumber"
                            className={(getClassName("kcInputClass"), `outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter ${(dummyFormData.phoneNumber === '' || invalidPhoneNo) ? 'shadow-errorShadow  border-[#C61818] ' : 'border-bColor'}`)}
                            name="phoneNumber"
                            placeholder={msgStr("phoneNumberPH")}
                            onChange={handleFormData}
                            value={dummyFormData.phoneNumber ?? ""}
                            autoComplete="off"
                            min="0"
                            onKeyDown={onlyNumbers}
                            maxLength={phoneNoMax}
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold font-inter">
                            {(invalidPhoneNo && dummyFormData.phoneNumber !== '') && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;{msg('invalidPhoneNo')}</span>}
                            {dummyFormData.phoneNumber === '' && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp; {msg('inputErrorMsg')} &nbsp; {msg("phoneNumber")}</span>}
                            {(phoneNoMax === dummyFormData.phoneNumber?.length && !invalidPhoneNo) && <span className="flex items-start text-[#8B6105] font-semibold">{msg('maxLengthErrMsg')}&nbsp;{emailMax}&nbsp;{msg('charactersText')}</span>}
                        </span>}
                    </div>
                </div>
                {!realm.registrationEmailAsUsername && (
                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("username", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="username" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                                {msg("username")}
                                {/* <ToolTip tooltip={msgStr('userNamePolicy')} dir={locale?.currentLanguageTag}>
                                    <img className={"mx-2 cursor-pointer"} alt="info" src={info} />
                                </ToolTip> */}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="username"
                                className={(getClassName("kcInputClass"), `outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter ${(dummyFormData.username === '' || invalidUserName || minLength) ? 'shadow-errorShadow border-[#C61818]' : 'border-bColor'}`)}
                                name="username"
                                placeholder={msgStr("userNamePH")}
                                onChange={handleFormData}
                                value={dummyFormData.username ?? ""}
                                autoComplete="off"
                                maxLength={userNameMax ? userNameMax : 2048}
                            />
                            {<span className="text-[#C61818] mb-0 font-semibold font-inter">
                                {dummyFormData.username === '' && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("username")}</span></span>}
                                {(invalidUserName && dummyFormData.username !== '') && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('invalidUserName')}</span></span>}
                                {(minLength && dummyFormData.username !== '') && <span className="flex items-start"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('lengthErrMessage')} {userNameMin} {msg('and')} {userNameMax}</span></span>}
                                {(userNameMax === dummyFormData.username?.length) && <span className="flex items-start text-[#8B6105] font-semibold">{msg('maxLengthErrMsg')}&nbsp;{userNameMax}&nbsp;{msg('charactersText')}</span>}
                            </span>}
                        </div>
                    </div>
                )}
                {passwordRequired && (
                    <>
                        <div
                            className={clsx(
                                getClassName("kcFormGroupClass"),
                                messagesPerField.printIfExists("password", getClassName("kcFormGroupErrorClass"))
                            )}
                        >
                            <div className={(getClassName("kcLabelWrapperClass"), 'flex px-[20px]')}>
                                <label htmlFor="password" className={(getClassName("kcLabelClass"), 'text-hTextColor flex flex-row items-center mb-1 font-bold font-inter text-xl')}>
                                    {msg("password")}
                                </label>
                                <ToolTip tooltip={msgStr('passwordInfo')} dir={locale?.currentLanguageTag}>
                                    {info}
                                </ToolTip>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className={`border flex flex-row justify-between items-center border-solid rounded-lg h-14 px-3 font-inter ${dummyFormData.password === '' ? 'shadow-errorShadow border-[#C61818] ' : ' border-bColor'}`}>
                                    <input
                                        type={passwordType}
                                        id="password"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password"
                                        placeholder={msgStr("passwordPlaceholder")}
                                        onChange={handleFormData}
                                        autoComplete="off"
                                    />
                                    {passwordType === 'password' ? <img tabIndex={0} className="cursor-pointer" onClick={() => showPassword('password')} onKeyDown={(e) => getTabEvents(e, () => showPassword('password'))} alt="" src={eyeIcon} /> : <img tabIndex={0} onKeyDown={(e) => getTabEvents(e, () => showPassword('password'))} className="cursor-pointer" onClick={() => showPassword('password')} alt="" src={eyeIconOff} />}
                                </div>
                                {/* { && <span className="flex items-center"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordConditions')}</span>} */}
                                {/* {ConfPasswordMatch && <span className="flex items-center text-[#C61818] mb-0 font-semibold"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>} */}
                                {dummyFormData.password === '' && <span className="flex items-start text-[#C61818] mb-0 font-semibold"><img className="inline mt-1" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} &nbsp; {msg("password")}</span>}

                            </div>
                        </div>

                        <div
                            className={clsx(
                                getClassName("kcFormGroupClass"),
                                messagesPerField.printIfExists("password-confirm", getClassName("kcFormGroupErrorClass"))
                            )}
                        >
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor="password-confirm" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                                    {msg("confPassword")}
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className={`flex flex-row justify-between items-center border border-solid rounded-lg h-14 px-3 font-inter ${(dummyFormData["password-confirm"] === '' || confPasswordMatch) ? 'shadow-errorShadow  border-[#C61818] ' : ' border-bColor'}`}>
                                    <input type={confPasswordType}
                                        id="password-confirm"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password-confirm"
                                        onChange={handleFormData}
                                        placeholder={msgStr("confPasswordPlaceholder")}
                                        autoComplete="off"
                                    />
                                    {confPasswordType === 'password' ? <img className="cursor-pointer" tabIndex={0} onClick={() => showPassword('password-confirm')} onKeyDown={(e) => getTabEvents(e, () => showPassword('password-confirm'))} alt="" src={eyeIcon} /> : <img className="cursor-pointer" tabIndex={0} onClick={() => showPassword('password-confirm')} onKeyDown={(e) => getTabEvents(e, () => showPassword('password-confirm'))} alt="" src={eyeIconOff} />}
                                </div>
                                {(confPasswordMatch && dummyFormData["password-confirm"] !== '') && <span className="flex items-start text-[#C61818] mb-0 font-semibold font-inter"> <img className="inline mt-1" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>}
                                {dummyFormData["password-confirm"] === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-start font-inter"><img className="inline mt-1" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("passwordConfirm")}</span></span>}
                            </div>
                        </div>
                    </>
                )}
                {recaptchaRequired && (
                    <div className="form-group">
                        <div className={getClassName("kcInputWrapperClass")}>
                            <Recaptcha
                                className="g-recaptcha"
                                sitekey={recaptchaSiteKey}
                                render="explicit"
                                verifyCallback={() => {
                                    addFormDataValue(prevData => ({
                                        ...prevData,
                                        'g-recaptcha-response': true
                                    }))
                                }}
                            />
                        </div>
                    </div>
                    // <div className="form-group">
                    //     <div className={getClassName("kcInputWrapperClass")}>
                    //         <div className="g-recaptcha" id="recaptcha-container" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                    //     </div>
                    // </div>
                )}
                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-buttons" className={(getClassName("kcFormButtonsClass"), 'font-inter px-8')}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            value={msgStr("doRegister")}
                            onClick={() => setReloadBtn(true)}
                            disabled={!dummyFormData.firstName || !dummyFormData.username || !dummyFormData.lastName || !dummyFormData.address || !dummyFormData.email || !dummyFormData.orgName || !dummyFormData.partnerType || !dummyFormData["password-confirm"] || !dummyFormData.password || !dummyFormData.phoneNumber || (recaptchaRequired && !dummyFormData["g-recaptcha-response"]) || invalidEmail || invalidPhoneNo || invalidUserName || confPasswordMatch || invalidFirstName || invalidLastName || minLength || invalidOrgValue}
                        />
                    </div>
                </div>
                <div>
                    <div className={(getClassName("kcFormOptionsWrapperClass"), 'text-center font-inter')}>
                        <span>
                            <span>{msg('alreadyMember')}</span>
                            <a href={url.loginUrl} className="text-hLinkColor font-bold text-xl" onClick={() => setReloadBtn(true)}> {msg("doLogIn")}</a>
                        </span>
                    </div>
                </div>
            </form>
        </Template>
    );
}
