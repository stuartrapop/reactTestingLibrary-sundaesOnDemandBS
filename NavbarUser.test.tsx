import React from "react";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { createMemoryHistory } from "history";

import { Router } from "react-router-dom";
// import ReactTestRenderer from 'react-test-renderer'; // use render from testing libary instead.
import { render, screen, fireEvent } from "@testing-library/react";
import { graphql, QueryRenderer } from "react-relay";
import userEvent from "@testing-library/user-event";

import NavbarUser from "../NavbarUser";
import { NavbarUserTestQuery } from "./__generated__/NavbarUserTestQuery.graphql";

describe("components > nodes > NavbarUser", (): void => {
  let container: any;
  let environment: RelayMockEnvironment;

  beforeEach(() => {
    environment = createMockEnvironment();
    const TestWrapper = () => {
      return (
        <QueryRenderer<NavbarUserTestQuery>
          environment={environment}
          query={graphql`
            query NavbarUserTestQuery @relay_test_operation {
              viewer {
                ...NavbarUser_viewer
              }
            }
          `}
          variables={{}}
          render={({ error, props }) => {
            if (error != null) {
              throw new Error();
            }

            if (props == null) {
              return null;
            }

            return (
              // @ts-expect-error
              <NavbarUser viewer={props?.viewer} shortCode="12345" />
            );
          }}
        />
      );
    };

    //   container = ReactTestRenderer.create(<TestWrapper />);
    const history = createMemoryHistory();
    history.push("/some/bad/route");

    container = render(
      <Router history={history}>
        <TestWrapper />
        );
      </Router>
    );
  });

  describe("should render with impersonated user", (): void => {
    it("should render with impersonated user", (): void => {
      environment.mock.resolveMostRecentOperation((operation) => {
        return MockPayloadGenerator.generate(operation, {
          String() {
            // Every scalar field with type String will have this default value
            return "Lorem Ipsum";
          },
          Viewer() {
            return {
              id: "45",
              firstName: "Stuart",
              lastName: "Rapoport",
              originalUser: {
                id: "47",
              },
            };
          },
        });
      });

      expect(container).toMatchSnapshot();
      expect(screen.queryAllByTestId("navbarUser_avatar_icon").length).toBe(1);
    });
  });

  describe("should render without impersonated user", (): void => {
    it("should exist", (): void => {
      expect(typeof NavbarUser).toEqual("object");
    });

    it("should render with impersonated user", (): void => {
      environment.mock.resolveMostRecentOperation((operation) => {
        return MockPayloadGenerator.generate(operation, {
          String() {
            // Every scalar field with type String will have this default value
            return "Lorem Ipsum";
          },
          Viewer() {
            return {
              id: "45",
              firstName: "Stuart",
              lastName: "Rapoport",
              originalUser: null,
            };
          },
        });
      });

      expect(container).toMatchSnapshot();
      expect(screen.queryAllByTestId("navbarUser_avatar_icon").length).toBe(0);
    });
  });

  describe("menu should be present on click of drowdown arrow", (): void => {
    it("should render with impersonated user", (): void => {
      environment.mock.resolveMostRecentOperation((operation) => {
        return MockPayloadGenerator.generate(operation, {
          String() {
            // Every scalar field with type String will have this default value
            return "Lorem Ipsum";
          },
          Viewer() {
            return {
              id: "45",
              firstName: "Stuart",
              lastName: "Rapoport",
              originalUser: null,
            };
          },
        });
      });

      const dropdownButton = screen.getByTestId("navbarUser_dropdown_button");
      expect(screen.queryAllByTestId("navbarUser_menu").length).toBe(0);
      userEvent.click(dropdownButton);
      expect(screen.queryAllByTestId("navbarUser_menu").length).toBe(1);
      fireEvent.click(dropdownButton);
      expect(screen.queryAllByTestId("navbarUser_menu").length).toBe(0);
    });
  });
});
