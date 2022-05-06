var searchTerm = getUrlParameter("search");

if (searchTerm) {

    // Build the docs for lunr to index
    let docs = [];
    let n = 0;
    let articles = document.getElementsByTagName('article');
    for (let i = 0; i < articles.length; i++) {
        let sectionHeadings = articles[i].getElementsByClassName('section-heading');
        for (let j = 0; j < sectionHeadings.length; j++) {
            docs[n] = {
                "id": n,
                "section_id": sectionHeadings[j].parentElement.id,
                "article": articles[i].getElementsByClassName('docs-heading').item(0).innerHTML,
                "section": sectionHeadings[j].innerHTML,
                "content": sectionHeadings[j].parentElement.innerText
            };
            n++;
        }
    }

    // Create the lunr index.
    var idx = lunr(function () {
        this.ref("id");
        this.field("section_id");
        this.field("article");
        this.field("section");
        this.field("content");

        docs.forEach(function (doc) {
            this.add(doc)
        }, this)
    })

    // Process results.
    let results = idx.search(searchTerm);

    let html = "<div class=\"container\"><article class=\"docs-article\"><h1 id=\"search-results\">Search Results</h1><p>Found " + results.length + " results.</p>";

    if (results.length) {
        results.forEach(function (r) {
            html += "<section class=\"docs-section\">";
            html += "<h2 class=\"section-heading\"><a href=\"docs.php#" + docs[r.ref].section_id + "\">" + docs[r.ref].section + "</a></h2>";
            html += "<p>Article: " + docs[r.ref].article + "</p>";
            //html +=   "<p>" + docs[r.ref].content.substring(0, 300).replace(/([^a-z0-9 ._\-]+)/gi, '') + "</p>";
            html += "<p>" + format(docs[r.ref].content, searchTerm) + "</p>";
            html += "</section>"
        });
        // } else {
        //     html += "<p>No results found.</p>";
    }

    // Replace the current content with the search result.
    document.querySelector(".docs-content").innerHTML = html + "</article></div>";
    document.getElementsByClassName('search-input')[0].value = searchTerm;

    // Reset the sidebar links so when clicked, they'll clear the search.
    let navLinks = document.getElementsByClassName('nav-link');
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].href = 'docs.php' + navLinks[i].getAttribute("href");
    }
}

// function getParameterByName(name, url = window.location.href) {
//     name = name.replace(/[\[\]]/g, '\\$&');
//     var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, ' '));
// }

function format(content, searchTerm) {
    var termIdx = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (termIdx >= 0) {
        var startIdx = Math.max(0, termIdx - 140);
        var endIdx = Math.min(content.length, termIdx + searchTerm.length + 140);
        var trimmedContent = (startIdx === 0) ? "" : "&hellip;";
        trimmedContent += content.substring(startIdx, endIdx);
        trimmedContent += (endIdx >= content.length) ? "" : "&hellip;"

        return trimmedContent.replace(new RegExp(searchTerm, "ig"), function matcher(match) {
            return "<strong>" + match + "</strong>";
        });
    } else {
        var emptyTrimmedString = content.substr(0, 280);
        emptyTrimmedString += (content.length < 280) ? "" : "&hellip;";
        return emptyTrimmedString;
    }
}