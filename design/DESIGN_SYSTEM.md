# Telco X Design System

## Brand direction







## Colour palette

|Token|Hex|Use|
|-|-|-|
|Brand navy|`#102A43`|Header, major headings, strong text|
|Brand blue|`#146EF5`|Primary buttons, links, selected controls|
|Accent aqua|`#007F7D`|Technology highlights and secondary accents|
|Page background|`#F5F8FC`|Main page background|
|Surface|`#FFFFFF`|Cards, search panel, modal|
|Body text|`#172B4D`|Paragraphs and labels|
|Muted text|`#5F6B7A`|Supporting text and metadata|
|Border|`#D9E2EC`|Card, field, and divider borders|
|Success green|`#1B7F55`|Green RAG state and positive status|
|Warning amber|`#A85D00`|Amber RAG state and warnings|
|Alert red|`#B8322A`|Red RAG state and errors|

Use dark body text on pale backgrounds. Do not rely on colour alone for RAG states. Always show the words Green, Amber, or Red.



## Typography

Use this font stack:

`Inter, Arial, Helvetica, sans-serif`

|Style|Size|Weight|Suggested line height|
|-|-|-|-|
|Display heading|40 px|700|48 px|
|Page heading|30 px|700|38 px|
|Section heading|22 px|650|30 px|
|Card heading|18 px|650|26 px|
|Body|16 px|400|24 px|
|Small label|14 px|500|20 px|

On narrow screens, reduce the display heading to 32 px.



## Spacing and shape

Use an 8 px spacing rhythm. Common values are 8, 16, 24, 32, and 48 px.

* Card radius: 12 px
* Input and button radius: 8 px
* Card padding: 24 px on desktop and 16 px on mobile
* Maximum content width: 1120 px
* Minimum touch target: 44 px
* Card shadow: subtle, with a visible border retained



## Page layout

### Header

Use a compact header with the text wordmark `Telco X`. The wordmark links to the home page.

### Home page

Centre the main search panel within a wide content container. Keep the title, explanation, field, and button close enough to scan as one task.

### Address result page

Place the address and connection badge above the map. Use a two-column card grid on desktop and one column on mobile.

### Detail and provider page

Use a clear back link, page title, summary strip, and stacked detail cards. Provider rows should show a provider name and one sign-up button.



## Core components

|Component|Guidance|
|-|-|
|Primary button|Brand blue background, white text, clear action label|
|Secondary button|White surface, brand blue text, blue border|
|Search field|Visible label, example text, suggestion list, and inline error|
|Card|White surface, border, short heading, main value, and one action|
|Connection badge|Active, Previously connected, or Never connected|
|RAG badge|Coloured dot, status word, and parameter label|
|Map panel|16:9 area with pin, address, and a fallback coordinates label|
|Product card|Product name, technology, speed pair, monthly price, and choose button|
|Provider row|Provider name, selected product summary, and sign-up button|
|Modal|Short confirmation, close button, and no real data submission|

## 

## Content style

Use sentence case. Prefer direct labels such as `Check address`, `View network details`, and `Choose this plan`.

Explain technical terms once. For example, show `HFC` with the helper text `Hybrid fibre coaxial`.

## 

## Accessibility checks

* Every field has a visible label.
* Focus states are visible.
* Error text explains how to recover.
* Buttons state the action rather than using `Click here`.
* RAG states include text and colour.
* The map has a text alternative containing the address and coordinates.
* Heading levels follow the page structure.

