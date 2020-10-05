const creatAutocompleteConfig = {
    renderOption(movie) {
        const imgSRC = movie.Poster === 'N/A' ? '' : movie.Poster;
        return `
            <img src='${imgSRC}'/> 
            ${movie.Title} (${movie.Year})
        `;
    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey : '22162db0',
                s : searchTerm
            }
        });
        if (response.data.Error) { return [] };
        return response.data.Search;
    }
}

creatAutocomplete({ 
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    },
    ...creatAutocompleteConfig
})

creatAutocomplete({ 
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    },
    ...creatAutocompleteConfig
})

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
    const respone = await axios.get('http://www.omdbapi.com/', {
        params : {
            apikey : '22162db0',
            i : movie.imdbID
        }
    })
    summaryElement.innerHTML = movieTemplate(respone.data);

    if (side === 'left') {
        leftMovie = side;
    } else {
        rightMovie = side;
    }

    if (leftMovie && rightMovie) {
        runComparison();
    }
}

 const runComparison = () => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStat, index) => {
        let rightStat = rightSideStats[index];

        const leftSidevalue = leftStat.dataset.value;
        const rightSidevalue = rightStat.dataset.value;
        
        if (leftSidevalue > rightSidevalue) {
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warning');
        } else if (leftSidevalue < rightSidevalue) {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning');
        }
    });
}

const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
        let value = parseInt(word)
        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value
        }
    }, 0);

    return `
        <article class='media'>
            <figure class='media-left'>
                <p class='image'>
                    <img src='${movieDetail.Poster}'/>
                </p>
            </figure>
            <div class=''media-content'>
                <div class='content'>
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${awards} class='notification is-primary'>
            <p class='title'>${movieDetail.Awards}</p>
            <p class='subtitle'>Awards</p>
        </article>
        <article data-value=${dollars} class='notification is-primary'>
            <p class='title'>${movieDetail.BoxOffice}</p>
            <p class='subtitle'>Box Office</p>
        </article>
        <article data-value=${metascore} class='notification is-primary'>
            <p class='title'>${movieDetail.Metascore}</p>
            <p class='subtitle'>MetaScore</p>
        </article>
        <article data-value=${imdbRating} class='notification is-primary'>
            <p class='title'>${movieDetail.imdbRating}</p>
            <p class='subtitle'>IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class='notification is-primary'>
            <p class='title'>${movieDetail.imdbVotes}</p>
            <p class='subtitle'>IMDB Votes</p>
        </article>
    `;
}