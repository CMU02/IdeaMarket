import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import styled from "styled-components/native";

const InputContainer = styled(View)`
  margin-bottom: 20px;
`;

const Label = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  margin-bottom: 8px;
`;

const StyledInput = styled(TextInput)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #09182a;
  background-color: #ffffff;
`;

interface InputProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export default function Input({
  label,
  required = false,
  ...props
}: InputProps) {
  return (
    <InputContainer>
      <Label>
        {label}
        {required && <Text style={{ color: "#FF0000" }}> *</Text>}
      </Label>
      <StyledInput {...props} />
    </InputContainer>
  );
}
