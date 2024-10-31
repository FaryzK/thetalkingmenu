import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import {
  fetchChatBot,
  updateSuggestedQuestions,
} from "../redux/slices/chatBotSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "draft-js/dist/Draft.css";
import setImmediate from "setimmediate";

export default function SuggestedQuestions() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const {
    data: chatBot,
    status,
    error,
  } = useSelector((state) => state.chatBot);

  // Initialize editor states
  const [questions, setQuestions] = useState(() => {
    // If no suggested questions, start with two empty editors
    if (!chatBot?.suggestedQuestions?.length) {
      return [EditorState.createEmpty(), EditorState.createEmpty()];
    }

    // Safely convert suggested questions to EditorState
    return chatBot.suggestedQuestions.map((question) => {
      try {
        // Check if the question is a valid Draft.js raw content state
        if (question && question.blocks && Array.isArray(question.blocks)) {
          return EditorState.createWithContent(convertFromRaw(question));
        }
        // Fallback to empty editor state if invalid
        return EditorState.createEmpty();
      } catch (error) {
        console.error("Error creating editor state:", error);
        return EditorState.createEmpty();
      }
    });
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const token = await user.getIdToken();
          try {
            const result = await dispatch(
              fetchChatBot({ token, restaurantId })
            ).unwrap();

            if (result && result.suggestedQuestions) {
              // Enhanced logging and validation for each question
              const questionsData = result.suggestedQuestions.map(
                (question, index) => {
                  console.log(`Processing question ${index}:`, question);

                  try {
                    // Check if question has the required structure for convertFromRaw
                    if (
                      question &&
                      typeof question === "object" &&
                      Array.isArray(question.blocks) &&
                      question.blocks.length > 0 &&
                      typeof question.blocks[0].text === "string"
                    ) {
                      // Ensure entityMap is defined
                      const validQuestion = {
                        ...question,
                        entityMap: question.entityMap || {}, // Default to an empty object if undefined
                      };
                      return EditorState.createWithContent(
                        convertFromRaw(validQuestion)
                      );
                    } else {
                      console.warn(
                        `Question ${index} is empty or incorrectly formatted.`
                      );
                      return EditorState.createEmpty();
                    }
                  } catch (error) {
                    console.error(`Error processing question ${index}:`, error);
                    return EditorState.createEmpty();
                  }
                }
              );

              // Ensure there are at least two editor states
              const finalQuestions =
                questionsData.length < 2
                  ? [
                      ...questionsData,
                      ...Array(2 - questionsData.length).fill(
                        EditorState.createEmpty()
                      ),
                    ]
                  : questionsData;

              setQuestions(finalQuestions);
            }
          } catch (error) {
            console.error("Fetch error:", error);
          }
        };
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [dispatch, restaurantId]);

  const handleKeyCommand = (command, editorState, index) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setQuestions(questions.map((q, i) => (i === index ? newState : q)));
      return "handled";
    }
    return "not-handled";
  };

  const handleSave = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();

    // Convert each EditorState to raw content, ensuring valid structure
    const formattedQuestions = questions.map((q) => {
      const contentState = q.getCurrentContent();
      return convertToRaw(contentState);
    });

    dispatch(
      updateSuggestedQuestions({
        token,
        restaurantId,
        suggestedQuestions: formattedQuestions,
      })
    );
  };

  const toggleInlineStyle = (index, style) => {
    setQuestions(
      questions.map((q, i) =>
        i === index ? RichUtils.toggleInlineStyle(q, style) : q
      )
    );
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "failed") return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Update Suggested Questions</h2>
      {questions.map((editorState, index) => (
        <div key={index} className="mb-4">
          <button
            onClick={() => toggleInlineStyle(index, "BOLD")}
            className="mb-2 px-3 py-1 bg-gray-200 rounded"
          >
            Bold
          </button>
          <Editor
            editorState={editorState}
            onChange={(newState) =>
              setQuestions(
                questions.map((q, i) => (i === index ? newState : q))
              )
            }
            handleKeyCommand={(command) =>
              handleKeyCommand(command, editorState, index)
            }
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save Questions
      </button>
    </div>
  );
}
