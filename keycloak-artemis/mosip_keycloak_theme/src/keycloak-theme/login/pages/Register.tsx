// ejected using 'npx eject-keycloak-page'
import { useState, useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import Recaptcha from 'react-recaptcha';
import arrow from '../assets/expand_more_FILL0_wght300_GRAD0_opsz24 (1).svg';
import eyeIcon from '../assets/visibility_FILL0_wght400_GRAD0_opsz48.svg';

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
    const { url, messagesPerField, register, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');
    const [orgDropdown, showOrgDropdown] = useState(false);
    const [partnerTypeValue, setPartnerType] = useState(register.formData.partnerType ?? '');
    const [orgValue, setOrgValue] = useState(register.formData.orgName ?? '');

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });


    console.log(kcContext)
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

    const selectedFormValue = (event: any) => {
        setPartnerType(event.target.value)
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
        console.log(val + '>>>>>>>>>>>>>>>')
        setOrgValue(val)
        showOrgDropdown(false)
    }

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
                <p className="text-pTextColor text-xl font-semibold">{msg("regDesc")}</p>
                <span className="text-pTextColor mt-4 text-xl font-semibold">
                    {msg("requiredFieldsTwo")} <span className="required">*</span> {msg("requiredFields")}
                </span>
            </>
        }>
            <form id="kc-register-form" className={getClassName("kcFormClass")} action={url.registrationAction} method="post">
                <div className={clsx(getClassName("kcFormGroupClass"), messagesPerField.printIfExists("partnerType", getClassName("kcFormGroupErrorClass")))}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="partnerType" className={getClassName("kcLabelClass")}>{msg("partnerType")}<span className="text-red-500">*</span></label>
                    </div>
                    <div className={getClassName('kcInputWrapperClass')}>
                        <select
                            id="partnerType"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full')}
                            name="partnerType"
                            onChange={event =>
                                selectedFormValue(event)
                            }
                            value={partnerTypeValue}>
                            <option value="" selected disabled hidden>{msg("selectAnOption")}</option>
                            <option value="Device Provider">Device Provider</option>
                            <option value="FTM Provider">FTM Provider</option>
                            <option value="Authentication Partner">Authentication Partner</option>
                            <option value="Credential Partner or ISP">Credential Partner or ISP</option>
                            <option value="ABIS Partner">ABIS Partner</option>
                            <option value="SDK Partner">SDK Partner</option>
                        </select>
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
                            {msg("firstName")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="firstName"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="firstName"
                            placeholder={msgStr("firstNamePH")}
                            defaultValue={register.formData.firstName ?? ""}
                        />
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
                            {msg("lastName")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="lastName"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="lastName"
                            placeholder={msgStr("lastNamePH")}
                            defaultValue={register.formData.lastName ?? ""}
                        />
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
                            {msg("orgName")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="orgName"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="orgName"
                            placeholder={msgStr("orgnamePH")}
                            defaultValue={orgValue}
                            autoComplete="off"
                            onClick={displayOrgDropdown}
                        />
                        {orgDropdown && (
                                <div className="absolute w-orgDropdownW z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" >
                                    <ul className="py-1 text-2xl text-gray-700" role="none" >
                                        <li onClick={() => selectOrgName('organisation 1')} className="block px-4 py-2 cursor-pointer" role="menuitem" id="menu-item-1">organisation 1</li>
                                        <li onClick={() => selectOrgName('organisation 2')} className="block px-4 py-2 cursor-pointer" role="menuitem" id="menu-item-2">organisation 2</li>
                                        <li onClick={() => selectOrgName('organisation 3')} className="block px-4 py-2 cursor-pointer" role="menuitem" id="menu-item-0">organisation 3</li>
                                    </ul>
                                </div>
                        )}
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
                            {msg("address")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="address"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="address"
                            placeholder={msgStr("addressPH")}
                            defaultValue={register.formData.address ?? ""}
                        />
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("email", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="email" className={getClassName("kcLabelClass")}>
                            {msg("email")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="email"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="email"
                            placeholder={msgStr("emailPH")}
                            defaultValue={register.formData.email ?? ""}
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div
                    className={clsx(getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("phoneNumber", getClassName("kcFormGroupErrorClass"!)))
                    }

                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="phoneNumber" className={getClassName("kcLabelClass")}>
                            {msg("phoneNumber")}<span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="phoneNumber"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                            name="phoneNumber"
                            placeholder={msgStr("phoneNumberPH")}
                            defaultValue={register.formData.phoneNumber ?? ""}
                        />
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
                                {msg("username")}<span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="username"
                                className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full p-2')}
                                name="username"
                                placeholder={msgStr("userNamePH")}
                                defaultValue={register.formData.username ?? ""}
                                autoComplete="username"
                            />
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
                                <label htmlFor="password" className={getClassName("kcLabelClass")}>
                                    {msg("password")}<span className="text-red-500">*</span>
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className='flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 p-2'>
                                    <input
                                        type={passwordType}
                                        id="password"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password"
                                        placeholder={msgStr("passwordPlaceholder")}
                                        autoComplete="new-password"
                                    />
                                    <img className="cursor-pointer" onClick={showPassword} alt="" src={eyeIcon} />
                                </div>
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
                                    {msg("passwordConfirm")}<span className="text-red-500">*</span>
                                </label>
                            </div>
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className='flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 p-2'>
                                    <input type={confPasswordType}
                                        id="password-confirm"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password-confirm"
                                        placeholder={msgStr("passwordPlaceholder")}
                                    />
                                    <img className="cursor-pointer" onClick={showConfPassword} alt="" src={eyeIcon} />
                                </div>
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
