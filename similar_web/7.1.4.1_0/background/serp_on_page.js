const selectorTopAds = '#tads ol li.ads-ad',
    selectorBottomAds = '#bottomads ol li.ads-ad',
    selectorMain = '#res .g:not(#imagebox_bigimages)',
    arrayAds = [],
    arrayMain = [];
let index = 0;

function serpAd(singleAd, index) {
    let title, href, cite, dItem, description, h3;
    h3 = singleAd.querySelector('h3');
    title = h3.innerText;
    if (h3.querySelector('a')) {
        href = h3.querySelectorAll('a')[1].href;
    } else {
        href = h3.parentNode;
        if (href.nodeName === 'A') {
            href = href.href;
        }
    }
    cite = singleAd.querySelector('cite').innerText;
    dItem = singleAd.querySelector('.ads-creative');
    description = dItem ? dItem.innerText : '';
    return { title, href, cite, description, index };
}

function serpMain(singleMain, index) {
    let href, title, a, dItem, description;
    a = singleMain.querySelector('a');
    title = a.querySelector('h3')
        ? a.querySelector('h3').innerText
        : a.innerText;
    href = a.href;
    dItem = singleMain.querySelector('.st');
    description = dItem ? dItem.innerText : '';
    return { title, href, description, index };
}
document.querySelectorAll(selectorTopAds).forEach(el => {
    arrayAds.push(serpAd(el, index++));
});
document.querySelectorAll(selectorMain).forEach(el => {
    arrayMain.push(serpMain(el, index++));
});
document.querySelectorAll(selectorBottomAds).forEach(el => {
    arrayAds.push(serpAd(el, index++));
});

function reformat(o) {
    const o2 = {
        url: o.href,
        label: o.title,
        position: o.index,
        description: o.description
    };
    if (o.cite) o2.green_link = o.cite;
    return o2;
}
const a = { org: arrayMain.map(reformat), ads: arrayAds.map(reformat) };
a;
