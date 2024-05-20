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
import eyeIconOff from '../assets/visibility_off.svg'
import info from '../assets/info.svg';
import error from '../assets/error.svg'
import ToolTip from "./shared/Tooltip";

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
    const { url, messagesPerField, register, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey, message } = kcContext;

    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');
    const [orgDropdown, showOrgDropdown] = useState(false);
    const [partnerTypesMenu, showPartnerTypeMenu] = useState(false);
    // const [partnerTypeValue, setPartnerType] = useState(register.formData.partnerType ?? '');
    const [dummyFormData, addFormDataValue] = useState(register.formData);
    const errorSummary = message?.summary.split('<br>')

    const inputRef = useRef<HTMLInputElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const partnerTypeRef = useRef<HTMLInputElement>(null)

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

    const selectedPartnerTypeValue = (value: any) => {
        // setPartnerType(value)
        addFormDataValue(prevState => ({
            ...prevState,
            partnerType: value
        }))
        showPartnerTypeMenu(false)
    }

    const showPassword = () => {
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password')
    }

    const showConfPassword = () => {
        confPasswordType === 'password' ? setConfPasswordType('text') : setConfPasswordType('password')
    }

    const displayOrgDropdown = () => {
        showOrgDropdown(current => !current)
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
        addFormDataValue(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    console.log(kcContext)
    console.log(dummyFormData)
    console.log(errorSummary)

    window.addEventListener("click", (e) => {
        if (orgDropdown && !menuRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
            showOrgDropdown(false)
        }
        if (!partnerTypeRef.current?.contains(e.target as Node)) {
            showPartnerTypeMenu(false)
        }
    })
    const { msg, msgStr } = i18n;
    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={
            <>
                <div id="kc-form-options">
                    <div className={getClassName("kcFormOptionsWrapperClass")}>
                        <span>
                            <button> <a href={url.loginUrl} className="flex flex-row items-center text-hLinkColor font-bold text-xl"> <img alt="arrow" src={arrow} />{msg("backToLogin")}</a></button>
                        </span>
                    </div>
                </div>
                <h1 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-sans">{msg("registerTitle")}</h1>
                <p className="text-pTextColor text-xl mt-3">{msg("regDesc")}</p>
                <span className="text-pTextColor mt-4 text-xl"> {msg("requiredFields")}</span>
            </>
        }>
            <form id="kc-register-form" className={getClassName("kcFormClass")} action={url.registrationAction} method="post">
                <div className={clsx(getClassName("kcFormGroupClass"), messagesPerField.printIfExists("partnerType", getClassName("kcFormGroupErrorClass")))}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="partnerType" className={getClassName("kcLabelClass")}>{msg("partnerType")}</label>
                    </div>
                    <div className={getClassName('kcInputWrapperClass')}>

                        <div className={(message && !dummyFormData.partnerType) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg flex justify-between items-center cursor-pointer px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg flex justify-between items-center cursor-pointer px-3'}
                            onClick={() => { showPartnerTypeMenu(!partnerTypesMenu) }}>
                            <input
                                type="text"
                                id="partnerType"
                                name="partnerType"
                                placeholder={msgStr("selectAnOption")}
                                className='w-full border-none outline-none cursor-pointer h-full'
                                readOnly
                                value={dummyFormData.partnerType ?? ''}
                                ref={partnerTypeRef}
                            />
                            <div className="w-0 h-0 border-[5px] border-solid border-transparent border-t-black"></div>
                        </div>
                        {partnerTypesMenu && (
                            <div className="absolute max-[350px]:w-orgDropdownWForSM max-[590px]:w-[89%] w-[92%] z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-bColor mt-[2px]" >
                                <ul className="py-1 px-3 text-xl text-[#031640] font-semibold" role="none" >
                                    <li onClick={() => selectedPartnerTypeValue('Device Provider')} className="block py-2 cursor-pointer border-b" role="menuitem">Device Provider</li>
                                    <li onClick={() => selectedPartnerTypeValue('FTM Provider')} className="block py-2 cursor-pointer border-b" role="menuitem">FTM Provider</li>
                                    <li onClick={() => selectedPartnerTypeValue('Authentication Partner')} className="block py-2 cursor-pointer border-b" role="menuitem">Authentication Partner</li>
                                    <li onClick={() => selectedPartnerTypeValue('Credential Partner or ISP')} className="block py-2 cursor-pointer border-b" role="menuitem">Credential Partner or ISP</li>
                                    <li onClick={() => selectedPartnerTypeValue('ABIS Partner')} className="block py-2 cursor-pointer border-b" role="menuitem">ABIS Partner</li>
                                    <li onClick={() => selectedPartnerTypeValue('SDK Partner')} className="block py-2 cursor-pointer" role="menuitem">SDK Partner</li>
                                </ul>
                            </div>
                        )}
                        {(message && !dummyFormData.partnerType) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("partnerType")}</span></span>}
                    </div>
                </div>
                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("firstName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="firstName" className={getClassName("kcLabelClass")}>
                            {msg("firstName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="firstName"
                            className={(getClassName("kcInputClass"), ((message && !dummyFormData.firstName) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="firstName"
                            placeholder={msgStr("firstNamePH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.firstName ?? ""}
                        />
                        {(message && !dummyFormData.firstName) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("firstName")}</span></span>}
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("lastName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="lastName" className={getClassName("kcLabelClass")}>
                            {msg("lastName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="lastName"
                            className={(getClassName("kcInputClass"), ((message && !dummyFormData.lastName) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="lastName"
                            placeholder={msgStr("lastNamePH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.lastName ?? ""}
                        />
                        {(message && !dummyFormData.lastName) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("lastName")}</span></span>}
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("orgName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="orgName" className={getClassName("kcLabelClass")}>
                            {msg("orgName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="orgName"
                            className={(getClassName("kcInputClass"), ((message && !dummyFormData.orgName) ? 'shadow-errorShadowTwo outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="orgName"
                            placeholder={msgStr("orgnamePH")}
                            value={dummyFormData.orgName ?? ''}
                            autoComplete="off"
                            onChange={handleFormData}
                            onClick={displayOrgDropdown}
                            ref={inputRef}
                        />
                        {orgDropdown && (
                            <div ref={menuRef} className="absolute max-[350px]:w-orgDropdownWForSM max-[590px]:w-[89%] w-[92%] z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-bColor mt-[2px]" >
                                <ul className="py-1 px-3 text-2xl text-[#031640] font-semibold" role="none" >
                                    <li onClick={() => selectOrgName('organisation 1')} className="block py-2 cursor-pointer border-b" role="menuitem" id="menu-item-1">organisation 1</li>
                                    <li onClick={() => selectOrgName('organisation 2')} className="block py-2 cursor-pointer border-b" role="menuitem" id="menu-item-2">organisation 2</li>
                                    <li onClick={() => selectOrgName('organisation 3')} className="block py-2 cursor-pointer" role="menuitem" id="menu-item-0">organisation 3</li>
                                </ul>
                            </div>
                        )}
                        <div className="border border-[#EDDCAF] border-t-0 rounded-b-lg p-3 -mt-2 bg-[#FFF7E5]">
                            <span className="text-[#8B6105] font-semibold">{msg('orgInfoMsg')}</span>
                        </div>
                        {(message && !dummyFormData.orgName) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("orgName")}</span></span>}
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("address", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="address" className={getClassName("kcLabelClass")}>
                            {msg("address")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="address"
                            className={(getClassName("kcInputClass"), ((message && !dummyFormData.address) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="address"
                            placeholder={msgStr("addressPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.address ?? ""}
                        />
                        {(message && !dummyFormData.address) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("address")}</span></span>}
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("email", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="email" className={getClassName("kcLabelClass")}>
                            {msg("email")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="email"
                            className={(getClassName("kcInputClass"), ((message && (!dummyFormData.address || errorSummary?.includes("Email already exists.") || errorSummary?.includes("Invalid email address.") || errorSummary?.includes("Username already exists."))) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="email"
                            placeholder={msgStr("emailPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.email ?? ""}
                            autoComplete="email"
                        />
                        {message && <span className="text-[#C61818] mb-0 font-semibold">
                            {(errorSummary?.includes("Email already exists.") || errorSummary?.includes("Username already exists.")) && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msgStr('existingEmailErr')}</span>}
                            {errorSummary?.includes("Invalid email address.") && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msgStr('invalidEmailErr')}</span>}
                            {!dummyFormData.email && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} {msg("email")}</span>}
                        </span>}
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("phoneNumber", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="phoneNumber" className={getClassName("kcLabelClass")}>
                            {msg("phoneNumber")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="number"
                            id="phoneNumber"
                            className={(getClassName("kcInputClass"), ((message && (!dummyFormData.phoneNumber || message?.summary.includes("Length must be between 10 and 10."))) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="phoneNumber"
                            placeholder={msgStr("phoneNumberPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.phoneNumber ?? ""}
                        />
                        {message && <span className="text-[#C61818] mb-0 font-semibold">
                            {message?.summary.includes("Length must be between 10 and 10.") && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msg('invalidPhoneNo')}</span>}
                            {!dummyFormData.phoneNumber && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp; {msg('inputErrorMsg')} {msg("phoneNumber")}</span>}
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
                            <label htmlFor="username" className={getClassName("kcLabelClass")}>
                                {msg("username")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="username"
                                className={(getClassName("kcInputClass"), ((message && !dummyFormData.username) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                                name="username"
                                placeholder={msgStr("userNamePH")}
                                onBlur={handleFormData}
                                defaultValue={register.formData.username ?? ""}
                                autoComplete="username"
                            />
                            {(message && !dummyFormData.username) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("username")}</span></span>}
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
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor="password" className={(getClassName("kcLabelClass"), 'text-hTextColor text-xl flex flex-row items-center')}>
                                    {msg("password")}
                                    <ToolTip tooltip={msgStr('passwordInfo')}>
                                        {/* <button className="bg-gray-900 text-white p-3 rounded"> */}
                                        <img className="ml-2 cursor-pointer" alt="info" src={info} />
                                        {/* </button> */}
                                    </ToolTip>
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className={(message && (!dummyFormData.password || message?.summary.includes('Invalid password') || message?.summary.includes("Password confirmation doesn't match."))) ? 'shadow-errorShadow border border-[#C61818] flex flex-row justify-between items-center border-solid rounded-lg h-14 px-3' : 'flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3'}>
                                    <input
                                        type={passwordType}
                                        id="password"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password"
                                        placeholder={msgStr("passwordPlaceholder")}
                                        onBlur={handleFormData}
                                        autoComplete="new-password"
                                    />
                                    {passwordType === 'password' ? <img className="cursor-pointer" onClick={showPassword} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={showPassword} alt="" src={eyeIconOff} />}
                                </div>
                                {message && <span className="text-[#C61818] mb-0 font-semibold">
                                    {message?.summary.includes('Invalid password') && <span className="flex items-center"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordConditions')}</span>}
                                    {message?.summary.includes("Password confirmation doesn't match.") && <span className="flex items-center"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>}
                                    {/* {!dummyFormData.password && <span><img className="inline" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} {msg("password")}</span>} */}
                                </span>}
                            </div>
                        </div>

                        <div
                            className={clsx(
                                getClassName("kcFormGroupClass"),
                                messagesPerField.printIfExists("password-confirm", getClassName("kcFormGroupErrorClass"))
                            )}
                        >
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor="password-confirm" className={getClassName("kcLabelClass")}>
                                    {msg("passwordConfirm")}
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className={(message && !dummyFormData["password-confirm"]) ? 'shadow-errorShadow border border-[#C61818] flex flex-row justify-between items-center border-solid rounded-lg h-14 px-3' : 'flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3'}>
                                    <input type={confPasswordType}
                                        id="password-confirm"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password-confirm"
                                        onBlur={handleFormData}
                                        placeholder={msgStr("passwordPlaceholder")}
                                    />
                                    {confPasswordType === 'password' ? <img className="cursor-pointer" onClick={showConfPassword} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={showConfPassword} alt="" src={eyeIconOff} />}
                                </div>
                                {(message && !dummyFormData["password-confirm"]) && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("passwordConfirm")}</span></span>}
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
                                verifyCallback={(recaptchaToken) => {
                                    addFormDataValue(prevData => ({
                                        ...prevData,
                                        'g-recaptcha-response': recaptchaToken
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
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            value={msgStr("doRegister")}
                            disabled={!dummyFormData.firstName || !dummyFormData.lastName || !dummyFormData.address || !dummyFormData.email || !dummyFormData.orgName || !dummyFormData.partnerType || !dummyFormData["password-confirm"] || !dummyFormData.password || !dummyFormData.phoneNumber || !dummyFormData["g-recaptcha-response"]}
                        />
                    </div>
                </div>
                <div>
                    <div className={(getClassName("kcFormOptionsWrapperClass"), 'text-center')}>
                        <span>
                            <span>{msg('alreadyMember')}</span>
                            <a href={url.loginUrl} className="text-hLinkColor font-bold text-xl"> {msg("doLogIn")}</a>
                        </span>
                    </div>
                </div>
            </form>
        </Template>
    );
}
