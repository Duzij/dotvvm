﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DotVVM.Samples.Tests.Base;
using DotVVM.Testing.Abstractions;
using OpenQA.Selenium;
using Riganti.Selenium.Core;
using Xunit;
using Xunit.Abstractions;

namespace DotVVM.Samples.Tests.Feature
{
    public class AutoUITests : AppSeleniumTest
    {
        public AutoUITests(ITestOutputHelper output) : base(output)
        {
        }

        [Fact]
        public void Feature_AutoUI_AutoEditor()
        {
            RunInAllBrowsers(browser => {
                browser.NavigateToUrl(SamplesRouteUrls.FeatureSamples_AutoUI_AutoEditor);

                var editor = browser.Single("string", SelectByDataUi);
                AssertUI.TagName(editor, "input");
                AssertUI.Attribute(editor, "type", "text");

                editor = browser.Single("int", SelectByDataUi);
                AssertUI.TagName(editor, "input");
                AssertUI.Attribute(editor, "type", "number");

                editor = browser.Single("int-range", SelectByDataUi);
                AssertUI.TagName(editor, "input");
                AssertUI.Attribute(editor, "type", "number");
                AssertUI.Attribute(editor, "min", "0");
                AssertUI.Attribute(editor, "max", "10");

                editor = browser.Single("bool", SelectByDataUi);
                AssertUI.TagName(editor, "label");
                editor = editor.Single("input");
                AssertUI.Attribute(editor, "type", "checkbox");

                editor = browser.Single("datetime", SelectByDataUi);
                AssertUI.TagName(editor, "input");
                AssertUI.Attribute(editor, "type", "datetime-local");

                editor = browser.Single("product-id", SelectByDataUi);
                AssertUI.TagName(editor, "select");
                var options = editor.FindElements("option");
                options.ThrowIfDifferentCountThan(3);
                AssertUI.Attribute(options[0], "value", "00000000-0000-0000-0000-000000000001");
                AssertUI.InnerTextEquals(options[0], "First product");
                AssertUI.Attribute(options[1], "value", "00000000-0000-0000-0000-000000000002");
                AssertUI.InnerTextEquals(options[1], "Second product");
                AssertUI.Attribute(options[2], "value", "00000000-0000-0000-0000-000000000003");
                AssertUI.InnerTextEquals(options[2], "Third product");

                editor = browser.Single("service-type", SelectByDataUi);
                AssertUI.TagName(editor, "select");
                options = editor.FindElements("option");
                options.ThrowIfDifferentCountThan(2);
                AssertUI.Attribute(options[0], "value", "Development");
                AssertUI.InnerTextEquals(options[0], "Development work");
                AssertUI.Attribute(options[1], "value", "Support");
                AssertUI.InnerTextEquals(options[1], "Services & maintenance");

                editor = browser.Single("favorite-product-ids", SelectByDataUi);
                AssertUI.TagName(editor, "ul");
                options = editor.FindElements("li>label");
                options.ThrowIfDifferentCountThan(3);
                AssertUI.Attribute(options[0].Single("input"), "value", "00000000-0000-0000-0000-000000000001");
                AssertUI.InnerTextEquals(options[0].Single("span"), "First product");
                AssertUI.Attribute(options[1].Single("input"), "value", "00000000-0000-0000-0000-000000000002");
                AssertUI.InnerTextEquals(options[1].Single("span"), "Second product");
                AssertUI.Attribute(options[2].Single("input"), "value", "00000000-0000-0000-0000-000000000003");
                AssertUI.InnerTextEquals(options[2].Single("span"), "Third product");
            });
        }

        [Fact]
        public void Feature_AutoUI_AutoForm()
        {
            RunInAllBrowsers(browser => {
                browser.NavigateToUrl(SamplesRouteUrls.FeatureSamples_AutoUI_AutoForm);

                // selection hiding and showing
                var stateField = browser.Single("#State__input");
                AssertUI.IsDisplayed(stateField);

                var countryField = browser.Single("#CountryId__input");
                countryField.Select("2");

                stateField = browser.Single("#State__input");
                AssertUI.IsNotDisplayed(stateField);

                // validation
                var nameField = browser.Single("#Name__input");
                var streetField = browser.Single("#Name__input");

                AssertUI.IsNotDisplayed(nameField.ParentElement.ParentElement.Single(".help"));
                AssertUI.IsNotDisplayed(streetField.ParentElement.ParentElement.Single(".help"));

                var validateButton = browser.Single("input[type=button]");
                validateButton.Click();

                AssertUI.IsDisplayed(nameField.ParentElement.ParentElement.Single(".help"));
                AssertUI.IsDisplayed(streetField.ParentElement.ParentElement.Single(".help"));
            });
        }
    }
}
