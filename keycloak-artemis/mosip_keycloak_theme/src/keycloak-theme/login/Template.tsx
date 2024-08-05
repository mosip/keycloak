// Copy pasted from: https://github.com/InseeFrLab/keycloakify/blob/main/src/login/Template.tsx

import { useEffect, useState, useRef } from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import { usePrepareTemplate } from "keycloakify/lib/usePrepareTemplate";
import { type TemplateProps } from "keycloakify/login/TemplateProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";
import mosipLogo from './assets/mosip_logo.png';
import langIcon from './assets/language_FILL0_wght300_GRAD0_opsz24.svg';
import polygon from './assets/Polygon.svg';
import polygonRev from './assets/Polygon2.svg';
import rightTick from './assets/check_circle_FILL0_wght400_GRAD0_opsz48.svg';
import closeIcon from './assets/close_icon.svg';

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        // displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        headerNode,
        // showUsernameNode = null,
        infoNode = null,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const { msg, changeLocale, labelBySupportedLanguageTag, currentLanguageTag } = i18n;
    const [isLocaleOpen, setLocaleOpen] = useState(false);
    const [openErrTab, getOpenErrTab] = useState(true);

    const { realm, locale, auth, url, message, isAppInitiatedAction, pageId } = kcContext;
    const langCardRef = useRef<HTMLDivElement>(null);

    const { isReady } = usePrepareTemplate({
        "doFetchDefaultThemeResources": doUseDefaultCss,
        "styles": [
            `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
            `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
            `${url.resourcesCommonPath}/lib/zocial/zocial.css`,
            `${url.resourcesPath}/css/login.css`
        ],
        "htmlClassName": getClassName("kcHtmlClass"),
        "bodyClassName": getClassName("kcBodyClass"),
        "htmlLangProperty": locale?.currentLanguageTag,
        "documentTitle": i18n.msgStr("loginTitle", kcContext.realm.displayName)
    });

    useEffect(() => {
        if(localStorage.getItem("isLocaleopen"))
            localStorage.removeItem("isLocaleopen");
        console.log(`Value of MY_ENV_VARIABLE on the Keycloak server: "${kcContext.properties.MY_ENV_VARIABLE}"`);
    }, []);

    const openLangCard = () =>{
        setLocaleOpen(!isLocaleOpen);
        !isLocaleOpen ? localStorage.setItem("isLocaleopen", 'true') : localStorage.removeItem("isLocaleopen");
    }

    if (!isReady) {
        return null;
    }

    console.log(kcContext)
    window.addEventListener("click", (e) => {
        if (!langCardRef.current?.contains(e.target as Node)) {
            setLocaleOpen(false)
            if(localStorage.getItem("isLocaleopen"))
                localStorage.removeItem("isLocaleopen")
        }
    })

    return (
        <div className={(getClassName("kcLoginClass"))} dir={currentLanguageTag === 'ar' ? 'rtl' : 'ltr'}>
            <div id="kc-header" className={(getClassName("kcHeaderClass"), 'mb-10 flex flex-row justify-between items-center px-20')}>
                <div><img className="h-20 w-30" alt="logo" src={mosipLogo} /></div>
                <div> {realm.internationalizationEnabled && (assert(locale !== undefined), true) && locale.supported.length > 1 && (
                    <div id="kc-locale">
                        <div id="kc-locale-wrapper" className={getClassName("kcLocaleWrapperClass")}>
                            <div ref={langCardRef}  onClick={openLangCard} className="kc-dropdown flex flex-row content-center" id="kc-locale-dropdown">
                                <img alt="langIcon" src={langIcon} />
                                <a className="font-semibold text-xl mx-2" href="#" id="kc-current-locale-link">
                                    {labelBySupportedLanguageTag[currentLanguageTag]}
                                </a>
                                {!isLocaleOpen && <img alt="" src={polygon} />}
                                {isLocaleOpen && <img alt="" src={polygonRev} />}
                                {isLocaleOpen && (<div className={`max-h-[400px] min-w-[200px] bg-white overflow-auto rounded-xl lang-dropDown font-inter shadow-langShadow ${currentLanguageTag === 'ar' ? 'mr-[-140px]' : 'ml-[-130px]'}`}>
                                    <>
                                        <span className="text-[#0D3077] text-xl font-bold px-[14px] py-[10px] flex content-center justify-between">
                                            <span>{labelBySupportedLanguageTag[currentLanguageTag]}</span>
                                            <img alt="" src={rightTick} />
                                        </span>
                                        <hr className="mx-4 border-[1px] border-[#D8D8D8]" />
                                    </>
                                    {locale.supported.map(({ languageTag }) => (
                                        <>
                                            {(currentLanguageTag !== languageTag) && (
                                                <>
                                                    <span key={languageTag} onClick={() => changeLocale(languageTag)} className="text-[#0D3077] px-[14px] py-[10px] flex content-center justify-between cursor-pointer hover:bg-[#F4F8FF]">
                                                        <a href="#">
                                                            <span className="text-xl">{labelBySupportedLanguageTag[languageTag]}</span>
                                                        </a>
                                                    </span>
                                                    <hr className="mx-4 last:hidden border-[#D8D8D8]" />
                                                </>
                                            )}
                                        </>
                                    ))}
                                </div>)}
                            </div>
                        </div>
                    </div>
                )
                }</div >
            </div >
            <div className="flex flex-col min-h-[83vh] justify-center align-center">
                <div>
                    <div className="flex justify-center">
                        <div className={clsx(getClassName("kcFormCardClass"), displayWide && getClassName("kcFormCardAccountClass"), 'rounded-3xl p-5')}>
                            <header className={getClassName("kcFormHeaderClass")}>
                                {headerNode}
                                {/* {!(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                        displayRequiredFields ? (
                            <div className={getClassName("kcContentWrapperClass")}>
                                <div className={clsx(getClassName("kcLabelWrapperClass"), "subtitle")}>
                                    <span className="subtitle">
                                        <span className="required">*</span>
                                        {msg("requiredFields")}
                                    </span>
                                </div>
                                <div className="col-md-10">
                                    <h1 id="kc-page-title">{headerNode}</h1>
                                </div>
                            </div>
                        ) : (
                            <>
                              <h1 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-sans">{headerNode}</h1>
                              <p className="text-pTextColor">{descText}</p>
                            </>
                        )
                    ) : displayRequiredFields ? (
                        <div className={getClassName("kcContentWrapperClass")}>
                            <div className={clsx(getClassName("kcLabelWrapperClass"), "subtitle")}>
                                <span className="subtitle">
                                    <span className="required">*</span> {msg("requiredFields")}
                                </span>
                            </div>
                            <div className="col-md-10">
                                {showUsernameNode}
                                <div className={getClassName("kcFormGroupClass")}>
                                    <div id="kc-username">
                                        <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                        <a id="reset-login" href={url.loginRestartFlowUrl}>
                                            <div className="kc-login-tooltip">
                                                <i className={getClassName("kcResetFlowIcon")}></i>
                                                <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {showUsernameNode}
                            <div className={getClassName("kcFormGroupClass")}>
                                <div id="kc-username">
                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                        <div className="kc-login-tooltip">
                                            <i className={getClassName("kcResetFlowIcon")}></i>
                                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </>
                    )} */}
                            </header>
                            <div id="kc-content">
                                <div id="kc-content-wrapper">
                                    {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                                    {displayMessage && openErrTab && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (pageId === 'login.ftl') && (
                                        <div className={`min-h-11 p-2 text-center font-semibold mb-3 rounded-lg px-4 ${message.type === "error" && "bg-errorBg text-errorColor"} ${message.type === "success" && "bg-[#E7F2E2] text-[#2E6E0D]"} ${(message.type === "warning" || message.type === 'info') && "bg-[#FFF7E5] text-[#8B6105"}`}>
                                            {/* {message.type === "success" && <span className={getClassName("kcFeedbackSuccessIcon")}></span>}
                                    {message.type === "warning" && <span className={getClassName("kcFeedbackWarningIcon")}></span>}
                                    {message.type === "info" && <span className={getClassName("kcFeedbackInfoIcon")}></span>} */}
                                            <img onClick={() => getOpenErrTab(!openErrTab)} className="h-4 w-4 float-right cursor-pointer" alt=""src={closeIcon} />
                                            <span className="kc-feedback-text"
                                                dangerouslySetInnerHTML={{
                                                    "__html": message.summary
                                                }}
                                            />
                                        </div>
                                    )}
                                    {children}
                                    {auth !== undefined && auth.showTryAnotherWayLink && showAnotherWayIfPresent && (
                                        <form
                                            id="kc-select-try-another-way-form"
                                            action={url.loginAction}
                                            method="post"
                                            className={clsx(displayWide && getClassName("kcContentWrapperClass"))}
                                        >
                                            <div
                                                className={clsx(
                                                    displayWide && [getClassName("kcFormSocialAccountContentClass"), getClassName("kcFormSocialAccountClass")]
                                                )}
                                            >
                                                <div className={getClassName("kcFormGroupClass")}>
                                                    <input type="hidden" name="tryAnotherWay" value="on" />
                                                    <a
                                                        href="#"
                                                        id="try-another-way"
                                                        onClick={() => {
                                                            document.forms["kc-select-try-another-way-form" as never].submit();
                                                            return false;
                                                        }}
                                                    >
                                                        {msg("doTryAnotherWay")}
                                                    </a>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                    {displayInfo && (
                                        <div id="kc-info" className={getClassName("kcSignUpClass")}>
                                            <div id="kc-info-wrapper" className={getClassName("kcInfoAreaWrapperClass")}>
                                                {infoNode}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
