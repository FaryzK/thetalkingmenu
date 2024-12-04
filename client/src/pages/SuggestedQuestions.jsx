import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
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
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function SuggestedQuestions() {
  const { restaurantId, dashboardId } = useParams();
  const dispatch = useDispatch();
  const {
    data: chatBot,
    status,
    error,
  } = useSelector((state) => state.chatBot);

  const navigate = useNavigate();

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

  return (
    <div className="p-6 bg-gray-100">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`)
        }
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-6">Update Suggested Questions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg mb-4">Editor</h3>
          <div className="space-y-4">
            {questions.map((editorState, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
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
          </div>
          <Button onClick={handleSave} color="blue" className="mt-4 w-full">
            Save Questions
          </Button>
        </div>

        {/* Mobile Preview Section */}
        <div className="mt-8 md:mt-0 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg mb-4">Mobile Preview</h3>
          <div className="border rounded-lg shadow-lg p-4 max-w-xs mx-auto bg-gray-900">
            <div className="flex flex-col gap-2">
              {savedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() =>
                    console.log(
                      question.blocks.map((block) => block.text).join(" ")
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 border border-white text-left"
                >
                  {question.blocks.map((block, idx) => {
                    const elements = [];
                    let lastOffset = 0;

                    const sortedRanges = block.inlineStyleRanges.sort(
                      (a, b) => a.offset - b.offset
                    );

                    sortedRanges.forEach((range, rangeIndex) => {
                      if (range.offset > lastOffset) {
                        elements.push(
                          <span key={`${idx}-${rangeIndex}-unstyled`}>
                            {block.text.slice(lastOffset, range.offset)}
                          </span>
                        );
                      }

                      elements.push(
                        <span
                          key={`${idx}-${rangeIndex}-styled`}
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

                      lastOffset = range.offset + range.length;
                    });

                    if (lastOffset < block.text.length) {
                      elements.push(
                        <span key={`${idx}-remaining-unstyled`}>
                          {block.text.slice(lastOffset)}
                        </span>
                      );
                    }

                    return <p key={idx}>{elements}</p>;
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
