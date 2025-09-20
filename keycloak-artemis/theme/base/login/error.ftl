<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
<div <#if locale?exists && locale.currentLanguageTag == "ara">dir="rtl"</#if>>
    <#if section = "header">
        ${msg("errorTitle")}
    <#elseif section = "form">
        <div id="kc-error-message">
            <p class="instruction">${message.summary?no_esc}</p>
            <p><a id="backToApplication" href="${url.loginUrl}">${kcSanitize(msg("tryAgain"))?no_esc}</a></p>
        </div>
    </#if>
</div>
</@layout.registrationLayout>