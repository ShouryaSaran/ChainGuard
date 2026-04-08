import httpx
from datetime import datetime, timedelta
from typing import Any
from textblob import TextBlob

from app.config import settings


DISRUPTION_KEYWORDS = {
    "strike",
    "closure",
    "flood",
    "storm",
    "protest",
    "delay",
    "shutdown",
    "congestion",
    "blocked",
    "suspended",
}

MOCK_ARTICLES = [
    {
        "title": "Port Workers Strike Halts Container Operations at Singapore Terminal",
        "source": {"name": "Shipping Times"},
        "sentiment": -0.72,
        "keywords_found": ["strike", "closure"],
        "url": "https://example.com/article1",
    },
    {
        "title": "Heavy Flooding Disrupts Supply Chain Across Southeast Asia",
        "source": {"name": "Logistics Daily"},
        "sentiment": -0.68,
        "keywords_found": ["flood", "delay", "congestion"],
        "url": "https://example.com/article2",
    },
    {
        "title": "Storm Warning Suspended - Port Operations Resume",
        "source": {"name": "Maritime News"},
        "sentiment": -0.15,
        "keywords_found": ["storm", "suspended"],
        "url": "https://example.com/article3",
    },
    {
        "title": "Congestion at Major Port Expected to Clear by Tomorrow",
        "source": {"name": "Trade Watch"},
        "sentiment": -0.30,
        "keywords_found": ["congestion", "delay"],
        "url": "https://example.com/article4",
    },
]


class NewsService:
    """Service for fetching and analyzing disruption-related news."""

    NEWSAPI_URL = "https://newsapi.org/v2/everything"

    @staticmethod
    def _extract_keywords(text: str) -> list[str]:
        """Extract disruption keywords from text."""
        text_lower = text.lower()
        found = []
        for keyword in DISRUPTION_KEYWORDS:
            if keyword in text_lower:
                found.append(keyword)
        return list(set(found))  # Remove duplicates

    @staticmethod
    def _analyze_sentiment(text: str) -> float:
        """Analyze sentiment of text using TextBlob. Returns -1.0 to 1.0."""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            return round(float(polarity), 2)
        except Exception:
            return 0.0

    @staticmethod
    async def get_disruption_news(locations: list[str]) -> dict[str, Any]:
        """
        Fetch and analyze disruption-related news for given locations.

        Args:
            locations: List of city/region names (e.g., ["Singapore", "Shanghai"])

        Returns:
            Dict with sentiment score, keyword count, articles, and disruption flag
        """
        api_key = settings.NEWS_API_KEY

        # If no API key, return realistic mock data
        if not api_key or api_key.strip() == "":
            return NewsService._get_mock_news_data()

        # Build search query
        location_query = " OR ".join(locations) if locations else "supply chain"
        search_query = f'({location_query}) AND (supply chain OR logistics OR port OR shipping OR strike OR flood OR storm)'

        # Calculate 48 hours ago
        since_date = datetime.utcnow() - timedelta(hours=48)
        since_str = since_date.strftime("%Y-%m-%d")

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    NewsService.NEWSAPI_URL,
                    params={
                        "q": search_query,
                        "from": since_str,
                        "sortBy": "relevancy",
                        "pageSize": 10,
                        "apiKey": api_key,
                    },
                )
                response.raise_for_status()
                data = response.json()

                if data.get("status") != "ok" or "articles" not in data:
                    return NewsService._get_mock_news_data()

                articles = data.get("articles", [])

        except (httpx.RequestError, ValueError):
            # Fall back to mock data if API fails
            return NewsService._get_mock_news_data()

        # Analyze articles
        processed_articles = []
        total_sentiment = 0.0
        total_keywords = 0

        for article in articles[:10]:  # Limit to 10
            title = article.get("title", "")
            description = article.get("description", "") or ""
            combined_text = f"{title} {description}"

            # Analyze sentiment
            sentiment = NewsService._analyze_sentiment(combined_text)
            total_sentiment += sentiment

            # Extract keywords
            keywords = NewsService._extract_keywords(combined_text)
            total_keywords += len(keywords)

            processed_articles.append(
                {
                    "title": title,
                    "sentiment": sentiment,
                    "keywords_found": keywords,
                    "url": article.get("url", ""),
                }
            )

        # Calculate aggregates
        num_articles = len(processed_articles)
        avg_sentiment = round(total_sentiment / num_articles, 2) if num_articles > 0 else 0.0
        has_major_disruption = avg_sentiment < -0.4 or total_keywords > 5

        return {
            "sentiment_score": avg_sentiment,
            "disruption_keyword_count": total_keywords,
            "articles": processed_articles,
            "has_major_disruption": has_major_disruption,
        }

    @staticmethod
    def _get_mock_news_data() -> dict[str, Any]:
        """Return realistic mock news data when API key is not available."""
        avg_sentiment = round(
            sum(a["sentiment"] for a in MOCK_ARTICLES) / len(MOCK_ARTICLES), 2
        )
        total_keywords = sum(len(a["keywords_found"]) for a in MOCK_ARTICLES)
        has_major = avg_sentiment < -0.4 or total_keywords > 5

        return {
            "sentiment_score": avg_sentiment,
            "disruption_keyword_count": total_keywords,
            "articles": MOCK_ARTICLES,
            "has_major_disruption": has_major,
        }


async def get_supply_chain_news(query: str = "supply chain") -> list[dict]:
    """Legacy wrapper for backward compatibility."""
    service = NewsService()
    result = await service.get_disruption_news([])
    return result.get("articles", [])
