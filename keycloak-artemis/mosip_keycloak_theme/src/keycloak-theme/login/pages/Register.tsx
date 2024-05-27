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
    const pattern = new RegExp(register?.attributesByName?.email?.validators?.pattern?.pattern);
    const phonePattern = new RegExp(register?.attributesByName?.phoneNumber?.validators?.pattern?.pattern);
    const organisationData = register?.attributesByName?.organisationName?.validators?.options?.options;

    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');
    const [orgDropdown, showOrgDropdown] = useState(false);
    const [partnerTypesMenu, showPartnerTypeMenu] = useState(false);
    const [dummyFormData, addFormDataValue] = useState(register.formData);
    const [invalidEmail, checkInvalidEmail] = useState(false);
    const [invalidPhoneNo, checkInvalidPhoneNo] = useState(false);
    const [ConfPasswordMatch, checkConfPasswordMatch] = useState(false);
    const [orgData, setOrgData] = useState(organisationData ? organisationData.slice() : undefined);

    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const partnerTypeRef = useRef<HTMLInputElement>(null);
    const partnerTypesMenuRef = useRef<HTMLDivElement>(null);

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
        showOrgDropdown(true)
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
        if (name === 'email' && value) {
            checkInvalidEmail(!pattern.test(value))
        }
        if (name === 'phoneNumber' && value) {
            checkInvalidPhoneNo(!phonePattern.test(String(value)))
        }

        if (name === 'orgName' && organisationData) {
            let newOrgData = organisationData.filter(item => {
                if (item.toLowerCase().includes(value.toLowerCase()))
                    return item
            })
            setOrgData(newOrgData)
        }

        addFormDataValue(prevState => ({
            ...prevState,
            [name]: value
        }))

        if (name === 'password-confirm' && dummyFormData.password) {
            if (value !== dummyFormData.password) {
                checkConfPasswordMatch(true)
            } else {
                checkConfPasswordMatch(false)
            }
        }
    }

    console.log(kcContext);
    console.log(dummyFormData);

    window.addEventListener("click", (e) => {
        if (orgDropdown && !menuRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
            if (dummyFormData.orgName) {
                showOrgDropdown(false)
            }
        }
        if (!partnerTypeRef.current?.contains(e.target as Node) && !partnerTypesMenuRef.current?.contains(e.target as Node)) {
            if (dummyFormData.partnerType) {
                showPartnerTypeMenu(false)
            }
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
                {message !== undefined && (
                    <div className='bg-errorBg min-h-11 p-2 text-center text-errorColor font-semibold mb-3'>
                        {/* {message.type === "success" && <span className={getClassName("kcFeedbackSuccessIcon")}></span>}
                                    {message.type === "warning" && <span className={getClassName("kcFeedbackWarningIcon")}></span>}
                                    {message.type === "info" && <span className={getClassName("kcFeedbackInfoIcon")}></span>} */}
                        <span className="kc-feedback-text"
                            dangerouslySetInnerHTML={{
                                "__html": message.summary
                            }}
                        />
                    </div>
                )}
                <div className={clsx(getClassName("kcFormGroupClass"), messagesPerField.printIfExists("partnerType", getClassName("kcFormGroupErrorClass")))}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="partnerType" className={getClassName("kcLabelClass")}>{msg("partnerType")}</label>
                    </div>
                    <div className={getClassName('kcInputWrapperClass')}>

                        <div className={dummyFormData.partnerType === '' ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg flex justify-between items-center cursor-pointer px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg flex justify-between items-center cursor-pointer px-3'}
                            onClick={() => {
                                if (partnerTypesMenu && dummyFormData.partnerType) {
                                    showPartnerTypeMenu(false);
                                } else {
                                    showPartnerTypeMenu(true);
                                }
                            }}>
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
                            <div ref={partnerTypesMenuRef} className="absolute max-[350px]:w-orgDropdownWForSM max-[590px]:w-[89%] w-[92%] z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-bColor mt-[2px]" >
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
                        {dummyFormData.partnerType === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("partnerType")}</span></span>}
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
                            className={(getClassName("kcInputClass"), (dummyFormData.firstName === '' ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="firstName"
                            placeholder={msgStr("firstNamePH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.firstName ?? ""}
                        />
                        {dummyFormData.firstName === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("firstName")}</span></span>}
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
                            className={(getClassName("kcInputClass"), (dummyFormData.lastName === '' ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="lastName"
                            placeholder={msgStr("lastNamePH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.lastName ?? ""}
                        />
                        {dummyFormData.lastName === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("lastName")}</span></span>}
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
                            className={(getClassName("kcInputClass"), (dummyFormData.orgName === '' ? 'shadow-errorShadowTwo outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="orgName"
                            placeholder={msgStr("orgnamePH")}
                            value={dummyFormData.orgName ?? ''}
                            autoComplete="off"
                            onChange={handleFormData}
                            onClick={displayOrgDropdown}
                            ref={inputRef}
                        />
                        {(orgDropdown && organisationData )&&
                            (<div ref={menuRef} className="absolute max-[350px]:w-orgDropdownWForSM max-[590px]:w-[89%] w-[92%] z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-bColor mt-[2px]" >
                                {(orgData?.length) ?
                                    <ul className="py-1 px-3 text-xl text-[#031640] font-semibold" role="none" >
                                        {orgData.map((item, index) => (
                                            <li key={item} id={'orgName' + index} onClick={() => selectOrgName(item)} className="block py-2 cursor-pointer border-b last-of-type:border-none" role="menuitem">{item}</li>
                                        ))}
                                    </ul> : (<p className="py-1 px-3 text-xl text-[#031640] font-semibold">{msg('nosearchData')}</p>)}
                            </div>)
                        }
                        <div className="border border-[#EDDCAF] border-t-0 rounded-b-lg p-3 -mt-2 bg-[#FFF7E5]">
                            <span className="text-[#8B6105] font-semibold">{msg('orgInfoMsg')}</span>
                        </div>
                        {dummyFormData.orgName === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("orgName")}</span></span>}
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
                            className={(getClassName("kcInputClass"), (dummyFormData.address === '' ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="address"
                            placeholder={msgStr("addressPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.address ?? ""}
                        />
                        {dummyFormData.address === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("address")}</span></span>}
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
                            className={(getClassName("kcInputClass"), ((dummyFormData.email === '' || invalidEmail) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="email"
                            placeholder={msgStr("emailPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.email ?? ""}
                            autoComplete="email"
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold">
                            {/* {(errorSummary?.includes("Email already exists.") || errorSummary?.includes("Username already exists.")) && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msgStr('existingEmailErr')}</span>} */}
                            {invalidEmail && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msgStr('invalidEmailErr')}</span>}
                            {dummyFormData.email === '' && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} &nbsp;{msg("email")}</span>}
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
                            className={(getClassName("kcInputClass"), ((dummyFormData.phoneNumber === '' || invalidPhoneNo) ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                            name="phoneNumber"
                            placeholder={msgStr("phoneNumberPH")}
                            onBlur={handleFormData}
                            defaultValue={register.formData.phoneNumber ?? ""}
                        />
                        {<span className="text-[#C61818] mb-0 font-semibold">
                            {invalidPhoneNo && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp;{msg('invalidPhoneNo')}</span>}
                            {dummyFormData.phoneNumber === '' && <span className="flex items-center"><img className="inline" alt='' src={error} />&nbsp; {msg('inputErrorMsg')} &nbsp; {msg("phoneNumber")}</span>}
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
                                className={(getClassName("kcInputClass"), (dummyFormData.username === '' ? 'shadow-errorShadow outline-none border border-[#C61818] border-solid h-14 rounded-lg w-full px-3' : 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3'))}
                                name="username"
                                placeholder={msgStr("userNamePH")}
                                onBlur={handleFormData}
                                defaultValue={register.formData.username ?? ""}
                                autoComplete="username"
                            />
                            {dummyFormData.username === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("username")}</span></span>}
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
                                <div className={(dummyFormData.password === '') ? 'shadow-errorShadow border border-[#C61818] flex flex-row justify-between items-center border-solid rounded-lg h-14 px-3' : 'flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3'}>
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
                                {/* { && <span className="flex items-center"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordConditions')}</span>} */}
                                {/* {ConfPasswordMatch && <span className="flex items-center text-[#C61818] mb-0 font-semibold"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>} */}
                                {dummyFormData.password === '' && <span className="flex items-center text-[#C61818] mb-0 font-semibold"><img className="inline" alt='' src={error} />&nbsp;{msg('inputErrorMsg')} &nbsp; {msg("password")}</span>}

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
                                <div className={(dummyFormData["password-confirm"] === '' || ConfPasswordMatch) ? 'shadow-errorShadow border border-[#C61818] flex flex-row justify-between items-center border-solid rounded-lg h-14 px-3' : 'flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3'}>
                                    <input type={confPasswordType}
                                        id="password-confirm"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password-confirm"
                                        onBlur={handleFormData}
                                        placeholder={msgStr("passwordPlaceholder")}
                                    />
                                    {confPasswordType === 'password' ? <img className="cursor-pointer" onClick={showConfPassword} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={showConfPassword} alt="" src={eyeIconOff} />}
                                </div>
                                {ConfPasswordMatch && <span className="flex items-center text-[#C61818] mb-0 font-semibold"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>}
                                {dummyFormData["password-confirm"] === '' && <span className="text-[#C61818] mb-0 font-semibold flex items-center"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('inputErrorMsg')} {msg("passwordConfirm")}</span></span>}
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
                            disabled={!dummyFormData.firstName || !dummyFormData.lastName || !dummyFormData.address || !dummyFormData.email || !dummyFormData.orgName || !dummyFormData.partnerType || !dummyFormData["password-confirm"] || !dummyFormData.password || !dummyFormData.phoneNumber || (recaptchaRequired && !dummyFormData["g-recaptcha-response"]) || invalidEmail || invalidPhoneNo || ConfPasswordMatch}
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
