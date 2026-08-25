import { GoogleGenAI } from '@google/genai';
import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';

// Initialize Gemini Client with fallback checking
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * @desc    Feature #5: Generate 3-bullet AI Key Takeaways summary for any book
 * @route   POST /api/ai/summarize
 * @access  Public
 */
export const summarizeBook = async (req, res) => {
  try {
    const { title, author, description } = req.body;

    if (!title) {
      return res.status(400).json({ status: 'fail', message: 'Book title is required.' });
    }

    const ai = getGeminiClient();

    // If Gemini API key is missing, return smart fallback summary
    if (!ai) {
      return res.status(200).json({
        status: 'success',
        source: 'fallback',
        summary: [
          `" ${title} " by ${author || 'Unknown Author'} is an influential work in its domain.`,
          `Key theme: ${description ? description.slice(0, 120) + '...' : 'Explores core concepts and insights for inquisitive readers.'}`,
          `Why read it: Provides practical knowledge, structured learning, and thought-provoking ideas.`
        ]
      });
    }

    const prompt = `You are a professional literary expert. Provide a concise, engaging 3-bullet point summary highlighting the main key takeaways of the book titled "${title}" by author "${author || 'Unknown'}". Book description: ${description || 'N/A'}. Format your response strictly as 3 bullet points starting with a dash (-). Do not include introductory text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const rawText = response.text || '';
    const bullets = rawText
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);

    res.status(200).json({
      status: 'success',
      source: 'gemini-ai',
      summary: bullets.length > 0 ? bullets : [rawText]
    });
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI summary.'
    });
  }
};

/**
 * @desc    Feature #5: Get personalized AI book recommendations based on user history
 * @route   POST /api/ai/recommend
 * @access  Private (Member)
 */
export const recommendBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get user's borrowing history
    const userTransactions = await Transaction.find({ user: userId })
      .populate({
        path: 'book',
        populate: { path: 'category' }
      })
      .limit(5);

    const readBooks = userTransactions
      .filter(t => t.book)
      .map(t => `${t.book.title} (${t.book.category?.name || 'General'})`);

    // 2. Fetch catalog books for recommendations
    const catalogBooks = await Book.find({})
      .populate('category', 'name icon')
      .limit(6);

    const ai = getGeminiClient();

    // Fallback recommendation if no Gemini key
    if (!ai || readBooks.length === 0) {
      return res.status(200).json({
        status: 'success',
        source: 'catalog-fallback',
        recommendations: catalogBooks.slice(0, 3)
      });
    }

    const prompt = `A reader has previously enjoyed the following books: [${readBooks.join(', ')}]. From our library catalog books: [${catalogBooks.map(b => b.title).join(', ')}], select the top 3 best matching book titles. Return strictly a JSON array of exact matching titles, e.g. ["Title 1", "Title 2", "Title 3"].`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const recommendedTitles = response.text || '';
    const matchedBooks = catalogBooks.filter(b => recommendedTitles.includes(b.title));

    res.status(200).json({
      status: 'success',
      source: 'gemini-ai',
      recommendations: matchedBooks.length > 0 ? matchedBooks : catalogBooks.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ Gemini Recommend Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to generate recommendations.' });
  }
};
