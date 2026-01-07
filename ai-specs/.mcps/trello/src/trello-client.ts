import axios, { AxiosInstance } from "axios";

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  url: string;
  idList: string;
  idBoard: string;
  closed: boolean;
  due?: string;
  labels: Array<{ id: string; name: string; color: string }>;
}

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
}

interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
}

interface TrelloComment {
  id: string;
  data: {
    text: string;
    card: {
      id: string;
      name: string;
    };
  };
  date: string;
}

export class TrelloClient {
  private client: AxiosInstance;
  private apiKey: string;
  private token: string;

  constructor(apiKey: string, token: string) {
    this.apiKey = apiKey;
    this.token = token;
    this.client = axios.create({
      baseURL: "https://api.trello.com/1",
      params: {
        key: this.apiKey,
        token: this.token,
      },
    });
  }

  /**
   * Get a card by ID, URL, or search query
   */
  async getCard(identifier: string): Promise<TrelloCard> {
    try {
      // Try to extract card ID from URL if it's a URL
      const cardId = this.extractCardId(identifier);

      // If we have a direct ID, fetch it
      if (cardId) {
        const response = await this.client.get<TrelloCard>(`/cards/${cardId}`);
        return response.data;
      }

      // Otherwise, search for the card
      const cards = await this.searchCards(identifier);
      if (cards.length === 0) {
        throw new Error(`No card found matching: ${identifier}`);
      }

      // Return the first match
      return cards[0];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for cards
   */
  async searchCards(query: string, boardId?: string): Promise<TrelloCard[]> {
    try {
      const params: any = {
        query,
        modelTypes: "cards",
        card_fields: "all",
      };

      if (boardId) {
        params.idBoards = boardId;
      }

      const response = await this.client.get("/search", { params });
      return response.data.cards || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Update a card
   */
  async updateCard(
    cardId: string,
    updates: { name?: string; desc?: string }
  ): Promise<TrelloCard> {
    try {
      const response = await this.client.put<TrelloCard>(
        `/cards/${cardId}`,
        updates
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Move a card to a different list
   */
  async moveCard(cardId: string, listId: string): Promise<TrelloCard> {
    try {
      const response = await this.client.put<TrelloCard>(`/cards/${cardId}`, {
        idList: listId,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get all lists from a board
   */
  async getLists(boardId: string): Promise<TrelloList[]> {
    try {
      const response = await this.client.get<TrelloList[]>(
        `/boards/${boardId}/lists`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get all boards for the authenticated user
   */
  async getBoards(): Promise<TrelloBoard[]> {
    try {
      const response =
        await this.client.get<TrelloBoard[]>("/members/me/boards");
      return response.data.filter((board) => !board.closed);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Add a comment to a card
   */
  async addComment(cardId: string, text: string): Promise<TrelloComment> {
    try {
      const response = await this.client.post<TrelloComment>(
        `/cards/${cardId}/actions/comments`,
        { text }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Create a new card in a list
   */
  async createCard(
    listId: string,
    name: string,
    desc?: string,
    pos: string = "top"
  ): Promise<TrelloCard> {
    try {
      const params: any = {
        idList: listId,
        name,
        pos,
      };

      if (desc) {
        params.desc = desc;
      }

      const response = await this.client.post<TrelloCard>("/cards", params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Trello API error: ${error.response?.data || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Extract card ID from various formats
   */
  private extractCardId(identifier: string): string | null {
    // If it's already a short ID (8 characters alphanumeric)
    if (/^[a-zA-Z0-9]{8}$/.test(identifier)) {
      return identifier;
    }

    // If it's a long ID (24 characters hex)
    if (/^[a-f0-9]{24}$/i.test(identifier)) {
      return identifier;
    }

    // Try to extract from URL: https://trello.com/c/ABC123/card-name
    const urlMatch = identifier.match(/trello\.com\/c\/([a-zA-Z0-9]{8})/);
    if (urlMatch) {
      return urlMatch[1];
    }

    return null;
  }
}
