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

  const [questions, setQuestions] = useState(() => {
    if (!chatBot?.suggestedQuestions?.length) {
      return [EditorState.createEmpty(), EditorState.createEmpty()];
    }
    return chatBot.suggestedQuestions.map((question) => {
      try {
        if (question && question.blocks && Array.isArray(question.blocks)) {
          // Ensure `entityMap` is initialized to an empty object if missing
          const validQuestion = {
            ...question,
            entityMap: question.entityMap || {},
          };
          return EditorState.createWithContent(convertFromRaw(validQuestion));
        }
        return EditorState.createEmpty();
      } catch (error) {
        console.error("Error creating editor state:", error);
        return EditorState.createEmpty();
      }
    });
  });

  const [savedQuestions, setSavedQuestions] = useState([]);

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
              const questionsData = result.suggestedQuestions.map(
                (question, index) => {
                  try {
                    if (
                      question &&
                      typeof question === "object" &&
                      Array.isArray(question.blocks) &&
                      question.blocks.length > 0 &&
                      typeof question.blocks[0].text === "string"
                    ) {
                      const validQuestion = {
                        ...question,
                        entityMap: question.entityMap || {},
                      };
                      return EditorState.createWithContent(
                        convertFromRaw(validQuestion)
                      );
                    } else {
                      return EditorState.createEmpty();
                    }
                  } catch (error) {
                    console.error(`Error processing question ${index}:`, error);
                    return EditorState.createEmpty();
                  }
                }
              );

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
              setSavedQuestions(result.suggestedQuestions); // Set saved questions for preview
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

    setSavedQuestions(formattedQuestions); // Update saved questions for preview
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Editor</h3>
          {questions.map((editorState, index) => (
            <div key={index} className="mb-4">
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

        <div className="mt-8 md:mt-0">
          <h3 className="font-semibold mb-2">Mobile Preview</h3>
          <div className="border rounded-lg shadow-lg p-4 max-w-xs mx-auto bg-white">
            {savedQuestions.map((question, index) => (
              <div key={index} className="mb-2 text-sm">
                {question.blocks.map((block, idx) => {
                  const elements = [];
                  let lastOffset = 0;

                  // Sort inline styles by offset to process sequentially
                  const sortedRanges = block.inlineStyleRanges.sort(
                    (a, b) => a.offset - b.offset
                  );

                  sortedRanges.forEach((range, rangeIndex) => {
                    // Add unstyled text before the styled range
                    if (range.offset > lastOffset) {
                      elements.push(
                        <span key={`${idx}-${rangeIndex}-unstyled`}>
                          {block.text.slice(lastOffset, range.offset)}
                        </span>
                      );
                    }

                    // Add styled text
                    elements.push(
                      <span
                        key={`${idx}-${rangeIndex}-bold`}
                        style={{
                          fontWeight:
                            range.style === "BOLD" ? "bold" : "normal",
                        }}
                      >
                        {block.text.slice(
                          range.offset,
                          range.offset + range.length
                        )}
                      </span>
                    );

                    // Update lastOffset to the end of the current range
                    lastOffset = range.offset + range.length;
                  });

                  // Add remaining unstyled text if any
                  if (lastOffset < block.text.length) {
                    elements.push(
                      <span key={`${idx}-remaining-unstyled`}>
                        {block.text.slice(lastOffset)}
                      </span>
                    );
                  }

                  return <p key={idx}>{elements}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
