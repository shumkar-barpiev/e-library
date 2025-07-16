import React from "react";
import { Box, BoxProps } from "@mui/material";
import Image from "next/image";

interface SmartLogoProps extends Omit<BoxProps, "children"> {
  variant?: "light" | "dark" | "auto";
  size?: number;
  width?: number;
  height?: number;
}

export const SmartLogo: React.FC<SmartLogoProps> = ({
  variant = "auto",
  size = 32,
  width,
  height,
  sx,
  ...boxProps
}) => {
  // Determine which logo to use
  const getLogoSrc = () => {
    if (variant === "light") return "/assets/light-logo.png";
    if (variant === "dark") return "/assets/dark-logo.png";

    // Auto mode - default to light for dark backgrounds
    return "/assets/light-logo.png";
  };

  const logoWidth = width || size;
  const logoHeight = height || size;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
      {...boxProps}
    >
      <Image
        src={getLogoSrc()}
        alt="ЭКитепкана Logo"
        width={logoWidth}
        height={logoHeight}
        style={{
          objectFit: "contain",
        }}
        onError={(e) => {
          // Fallback to text if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = "block";
          }
        }}
      />
      <Box
        component="span"
        sx={{
          display: "none", // Hidden by default, shown if image fails
          fontSize: `${size * 0.8}px`,
          fontWeight: "bold",
          color: variant === "light" ? "white" : variant === "dark" ? "black" : "inherit",
        }}
      >
        ЭК
      </Box>
    </Box>
  );
};
